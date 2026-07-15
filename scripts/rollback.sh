#!/bin/bash

#######################################
# Client Rollback Script
#
# This script allows rolling back to a previous deployment
# Supports:
# - Listing available backups
# - Dry-run mode to preview changes
# - Selective rollback to specific backup
#######################################

set -e

# Configuration
PROD_DIR=/var/www/keepwatching-client
BACKUP_DIR=/var/www/keepwatching-client-backups
REPO_DIR=~/git/keepwatching-client

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

dry_run_msg() {
    echo -e "${CYAN}[DRY-RUN]${NC} $1"
}

# Display usage
usage() {
    cat << EOF
${GREEN}Usage:${NC} $0 [OPTIONS]

${YELLOW}Options:${NC}
    --list              List all available backups
    --rollback N        Rollback to backup number N (use --list to see numbers)
    --tag vX.Y.Z        Rollback to the backup matching this version tag (alternative to --rollback N)
    --dry-run           Preview rollback without making changes
    --yes               Skip the interactive confirmation prompt (required for non-interactive/CI use)
    --help              Show this help message

${YELLOW}Examples:${NC}
    $0 --list                      # List all backups
    $0 --rollback 1 --dry-run      # Preview rollback to backup #1
    $0 --rollback 1                # Actually rollback to backup #1
    $0 --tag v1.4.2                # Rollback to the backup for v1.4.2
    $0 --tag v1.4.2 --yes          # Same, without the confirmation prompt (CI)

EOF
    exit 0
}

# List available backups
list_backups() {
    if [ ! -d "$BACKUP_DIR" ]; then
        error "Backup directory $BACKUP_DIR does not exist!"
        exit 1
    fi

    BACKUPS=($(sudo ls -1dt "$BACKUP_DIR"/backup_* 2>/dev/null || true))

    if [ ${#BACKUPS[@]} -eq 0 ]; then
        warning "No backups found in $BACKUP_DIR"
        exit 0
    fi

    echo -e "${GREEN}Available Backups:${NC}\n"
    echo -e "${CYAN}#${NC}  | ${CYAN}Date/Time${NC}           | ${CYAN}Git Commit${NC} | ${CYAN}Path${NC}"
    echo "---|---------------------|------------|-----"

    for i in "${!BACKUPS[@]}"; do
        BACKUP="${BACKUPS[$i]}"
        BACKUP_NAME=$(basename "$BACKUP")

        # Try to read metadata
        if sudo [ -f "$BACKUP/.deployment-meta" ]; then
            TIMESTAMP=$(sudo grep "TIMESTAMP=" "$BACKUP/.deployment-meta" | cut -d= -f2)
            GIT_COMMIT=$(sudo grep "GIT_COMMIT=" "$BACKUP/.deployment-meta" | cut -d= -f2)
            DEPLOY_DATE=$(sudo grep "DEPLOYMENT_DATE=" "$BACKUP/.deployment-meta" | cut -d= -f2)

            # Format timestamp to readable date
            if [ -n "$TIMESTAMP" ]; then
                FORMATTED_DATE=$(date -d "${TIMESTAMP:0:8} ${TIMESTAMP:9:2}:${TIMESTAMP:11:2}:${TIMESTAMP:13:2}" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "$DEPLOY_DATE")
            else
                FORMATTED_DATE="$DEPLOY_DATE"
            fi

            printf "${YELLOW}%-2s${NC} | %-19s | %-10s | %s\n" \
                "$((i+1))" \
                "$FORMATTED_DATE" \
                "${GIT_COMMIT:0:8}" \
                "$BACKUP_NAME"
        else
            # Fallback: extract date from directory name
            TIMESTAMP=$(echo "$BACKUP_NAME" | grep -oP 'backup_\K[0-9_]+' | head -1)
            printf "${YELLOW}%-2s${NC} | %-19s | %-10s | %s\n" \
                "$((i+1))" \
                "${TIMESTAMP//_/ }" \
                "unknown" \
                "$BACKUP_NAME"
        fi
    done

    echo ""
    info "Current production deployment:"
    if [ -f "$PROD_DIR/.deployment-meta" ]; then
        CURRENT_COMMIT=$(sudo grep "GIT_COMMIT=" "$PROD_DIR/.deployment-meta" | cut -d= -f2 || echo "unknown")
        CURRENT_DATE=$(sudo grep "DEPLOYMENT_DATE=" "$PROD_DIR/.deployment-meta" | cut -d= -f2 || echo "unknown")
        echo "  Commit: ${CURRENT_COMMIT:0:8}"
        echo "  Date:   $CURRENT_DATE"
    else
        echo "  No metadata found"
    fi
}

# Resolve a version tag (e.g. v1.4.2) to a backup number, for use with rollback().
# Echoes the backup number on success; errors and exits on failure.
resolve_tag_to_backup_num() {
    local TAG=$1

    if [ ! -d "$REPO_DIR/.git" ]; then
        error "Repo not found at $REPO_DIR — cannot resolve tag $TAG"
        exit 1
    fi

    local TARGET_COMMIT
    TARGET_COMMIT=$(git -C "$REPO_DIR" rev-list -n1 "$TAG" 2>/dev/null || true)
    if [ -z "$TARGET_COMMIT" ]; then
        error "Tag '$TAG' not found in $REPO_DIR"
        exit 1
    fi

    local TAG_BACKUPS
    TAG_BACKUPS=($(sudo ls -1dt "$BACKUP_DIR"/backup_* 2>/dev/null || true))

    if [ ${#TAG_BACKUPS[@]} -eq 0 ]; then
        error "No backups found in $BACKUP_DIR"
        exit 1
    fi

    for i in "${!TAG_BACKUPS[@]}"; do
        local CANDIDATE="${TAG_BACKUPS[$i]}"
        if sudo [ -f "$CANDIDATE/.deployment-meta" ]; then
            local CANDIDATE_COMMIT
            CANDIDATE_COMMIT=$(sudo grep "GIT_COMMIT=" "$CANDIDATE/.deployment-meta" | cut -d= -f2)
            if [ "$CANDIDATE_COMMIT" = "$TARGET_COMMIT" ]; then
                echo "$((i+1))"
                return 0
            fi
        fi
    done

    error "No backup found for $TAG (commit ${TARGET_COMMIT:0:8})."
    error "It may have aged out of the kept backups, or was never superseded by a later"
    error "deploy — a version's build output is only backed up once a later deploy replaces it."
    exit 1
}

# Perform rollback
rollback() {
    local BACKUP_NUM=$1
    local DRY_RUN=$2
    local ASSUME_YES=$3

    if [ ! -d "$BACKUP_DIR" ]; then
        error "Backup directory $BACKUP_DIR does not exist!"
        exit 1
    fi

    BACKUPS=($(sudo ls -1dt "$BACKUP_DIR"/backup_* 2>/dev/null || true))

    if [ ${#BACKUPS[@]} -eq 0 ]; then
        error "No backups found in $BACKUP_DIR"
        exit 1
    fi

    if [ "$BACKUP_NUM" -lt 1 ] || [ "$BACKUP_NUM" -gt ${#BACKUPS[@]} ]; then
        error "Invalid backup number. Please choose between 1 and ${#BACKUPS[@]}"
        exit 1
    fi

    BACKUP_PATH="${BACKUPS[$((BACKUP_NUM-1))]}"
    BACKUP_NAME=$(basename "$BACKUP_PATH")

    # Read backup metadata
    if sudo [ -f "$BACKUP_PATH/.deployment-meta" ]; then
        BACKUP_COMMIT=$(sudo grep "GIT_COMMIT=" "$BACKUP_PATH/.deployment-meta" | cut -d= -f2)
        BACKUP_DATE=$(sudo grep "DEPLOYMENT_DATE=" "$BACKUP_PATH/.deployment-meta" | cut -d= -f2)
    else
        BACKUP_COMMIT="unknown"
        BACKUP_DATE="unknown"
    fi

    if [ "$DRY_RUN" = true ]; then
        dry_run_msg "ROLLBACK DRY-RUN MODE"
        echo ""
        info "Would rollback to:"
        echo "  Backup:  $BACKUP_NAME"
        echo "  Commit:  ${BACKUP_COMMIT:0:8}"
        echo "  Date:    $BACKUP_DATE"
        echo ""
        dry_run_msg "Changes that would be made:"
        dry_run_msg "1. Current production backed up to: ${BACKUP_DIR}/backup_$(date +%Y%m%d_%H%M%S)_current"
        dry_run_msg "2. Production directory cleared: $PROD_DIR"
        dry_run_msg "3. Files copied from: $BACKUP_PATH"
        dry_run_msg "4. Total files to restore: $(sudo find "$BACKUP_PATH" -type f | wc -l)"
        echo ""
        dry_run_msg "To actually perform this rollback, run:"
        dry_run_msg "  $0 --rollback $BACKUP_NUM"
        echo ""
    else
        warning "About to rollback to:"
        echo "  Backup:  $BACKUP_NAME"
        echo "  Commit:  ${BACKUP_COMMIT:0:8}"
        echo "  Date:    $BACKUP_DATE"
        echo ""

        if [ "$ASSUME_YES" = true ]; then
            info "Skipping confirmation prompt (--yes)"
        else
            read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
            if [ "$CONFIRM" != "yes" ]; then
                info "Rollback cancelled"
                exit 0
            fi
        fi

        log "Starting rollback process..."

        # Backup current production before rollback
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        CURRENT_BACKUP="$BACKUP_DIR/backup_${TIMESTAMP}_current"

        log "Backing up current production to: $CURRENT_BACKUP"
        sudo cp -r "$PROD_DIR" "$CURRENT_BACKUP"

        # Restore from backup
        log "Clearing production directory..."
        sudo rm -rf "$PROD_DIR"/*

        log "Restoring files from backup..."
        sudo cp -r "$BACKUP_PATH"/* "$PROD_DIR/"

        # Update deployment metadata
        sudo bash -c "cat > '$PROD_DIR/.deployment-meta' << EOF
TIMESTAMP=$TIMESTAMP
GIT_COMMIT=$BACKUP_COMMIT
DEPLOYMENT_DATE=$(date '+%Y-%m-%d %H:%M:%S')
DEPLOYED_BY=ajgifford
ROLLBACK_FROM=$CURRENT_BACKUP
ROLLBACK_SOURCE=$BACKUP_PATH
EOF"

        # Fix file permissions so NGINX can read the restored files
        log "Setting file permissions..."
        sudo chown -R www-data:www-data "$PROD_DIR"
        sudo find "$PROD_DIR" -type f -exec chmod 644 {} \;
        sudo find "$PROD_DIR" -type d -exec chmod 755 {} \;

        # Reload NGINX to serve restored content
        log "Reloading NGINX..."
        sudo systemctl reload nginx

        log "Rollback completed successfully!"
        info "Production restored to commit: ${BACKUP_COMMIT:0:8}"
        info "Previous production saved to: $CURRENT_BACKUP"

        # Record this rollback in the shared deployment log (best-effort — a
        # backup made before this change may not have full metadata to draw from)
        ROLLBACK_VERSION=""
        ROLLBACK_TAG="—"
        TYPES_VERSION="—"
        UI_VERSION="—"
        COMMIT_DATE="—"
        BRANCH="main"
        if [ "$BACKUP_COMMIT" != "unknown" ] && [ -d "$REPO_DIR/.git" ]; then
            ROLLBACK_VERSION=$(git -C "$REPO_DIR" show "$BACKUP_COMMIT:package.json" 2>/dev/null | grep '"version"' | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')
            FOUND_TAG=$(git -C "$REPO_DIR" tag --points-at "$BACKUP_COMMIT" 2>/dev/null | grep '^v' | head -1)
            [ -n "$FOUND_TAG" ] && ROLLBACK_TAG="$FOUND_TAG"
            FOUND_TYPES=$(git -C "$REPO_DIR" show "$BACKUP_COMMIT:yarn.lock" 2>/dev/null | grep -A1 "^\"@ajgifford/keepwatching-types@" | grep version | head -1 | sed -E 's/.*version "([^"]+)".*/\1/')
            [ -n "$FOUND_TYPES" ] && TYPES_VERSION="$FOUND_TYPES"
            FOUND_UI=$(git -C "$REPO_DIR" show "$BACKUP_COMMIT:yarn.lock" 2>/dev/null | grep -A1 "^\"@ajgifford/keepwatching-ui@" | grep version | head -1 | sed -E 's/.*version "([^"]+)".*/\1/')
            [ -n "$FOUND_UI" ] && UI_VERSION="$FOUND_UI"
            FOUND_DATE=$(git -C "$REPO_DIR" log -1 --format=%cd --date=short "$BACKUP_COMMIT" 2>/dev/null || true)
            [ -n "$FOUND_DATE" ] && COMMIT_DATE="$FOUND_DATE"
            FOUND_BRANCH=$(git -C "$REPO_DIR" branch --show-current 2>/dev/null || true)
            [ -n "$FOUND_BRANCH" ] && BRANCH="$FOUND_BRANCH"
        fi
        VERSION_CELL="—"
        [ -n "$ROLLBACK_VERSION" ] && VERSION_CELL="v$ROLLBACK_VERSION"

        DEPLOY_DATETIME=$(date '+%Y-%m-%d %I:%M %p')
        LOG_SCRIPT=~/git/keepwatching-releases/deployment/scripts/record-deployment.sh

        if [ -x "$LOG_SCRIPT" ]; then
            ROW="| $DEPLOY_DATETIME | $VERSION_CELL | $ROLLBACK_TAG | $BACKUP_COMMIT | $COMMIT_DATE | $BRANCH | ajgifford | rollback | $TYPES_VERSION | $UI_VERSION | Rolled back to $BACKUP_NAME |"
            "$LOG_SCRIPT" client "$ROW" || warning "Failed to record rollback in shared log."
        else
            warning "Deployment log script not found at $LOG_SCRIPT — skipping log entry."
        fi
    fi
}

# Parse command line arguments
DRY_RUN=false
ASSUME_YES=false
ACTION=""
BACKUP_NUM=""
TARGET_TAG=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --list)
            ACTION="list"
            shift
            ;;
        --rollback)
            ACTION="rollback"
            BACKUP_NUM="$2"
            shift 2
            ;;
        --tag)
            ACTION="rollback"
            TARGET_TAG="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --yes)
            ASSUME_YES=true
            shift
            ;;
        --help)
            usage
            ;;
        *)
            error "Unknown option: $1"
            usage
            ;;
    esac
done

# Execute action
case $ACTION in
    list)
        list_backups
        ;;
    rollback)
        if [ -n "$TARGET_TAG" ]; then
            if [ -n "$BACKUP_NUM" ]; then
                warning "Both --rollback and --tag given; using --tag ($TARGET_TAG)"
            fi
            BACKUP_NUM=$(resolve_tag_to_backup_num "$TARGET_TAG")
            info "Resolved tag $TARGET_TAG to backup #$BACKUP_NUM"
        fi
        if [ -z "$BACKUP_NUM" ]; then
            error "Backup number or --tag required for rollback"
            usage
        fi
        rollback "$BACKUP_NUM" "$DRY_RUN" "$ASSUME_YES"
        ;;
    *)
        error "No action specified"
        usage
        ;;
esac
