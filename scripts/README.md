# Deployment Scripts

This directory contains scripts for deploying the KeepWatching client application to production (Raspberry Pi 5) with backup and rollback capabilities.

## Scripts Overview

### 1. `deploy.sh` - Enhanced Deployment Script

Deploys the application to production with automatic backup creation.

**Features:**
- Automatically backs up current production before deploying
- Tracks git commit hash and deployment metadata
- Maintains history of last 10 deployments (configurable)
- Auto-cleanup of old backups
- Comprehensive logging with timestamps

**Usage:**
```bash
cd ~/git/keepwatching-client
./scripts/deploy.sh
```

**What it does:**
1. Creates backup of current production with timestamp and git commit
2. Pulls latest code from git
3. Installs dependencies with yarn
4. Builds the project
5. Deploys build to `/var/www/keepwatching-client`
6. Saves deployment metadata for rollback reference

### 2. `rollback.sh` - Rollback Script

Restores a previous deployment with dry-run support.

**Features:**
- List all available backups with metadata
- Preview changes with dry-run mode
- Selective rollback to any previous deployment
- Confirmation prompt for safety
- Automatic backup of current state before rollback

**Usage:**

List available backups:
```bash
./scripts/rollback.sh --list
```

Preview a rollback (dry-run):
```bash
./scripts/rollback.sh --rollback 1 --dry-run
```

Actually perform a rollback:
```bash
./scripts/rollback.sh --rollback 1
```

Show help:
```bash
./scripts/rollback.sh --help
```

## Configuration

### Directories

- **Production**: `/var/www/keepwatching-client`
- **Backups**: `/var/www/keepwatching-client-backups`
- **Repository**: `~/git/keepwatching-client`

### Backup Retention

By default, the deployment script keeps the 10 most recent backups. To change this, edit the `MAX_BACKUPS` variable in `deploy.sh`:

```bash
MAX_BACKUPS=10  # Change this number
```

## Deployment Metadata

Each deployment stores metadata in `.deployment-meta` file:
- `TIMESTAMP` - When the deployment occurred
- `GIT_COMMIT` - Git commit hash of deployed code
- `DEPLOYMENT_DATE` - Human-readable deployment date/time
- `DEPLOYED_BY` - Username who performed deployment
- `ROLLBACK_FROM` - (Rollback only) Where current state was backed up
- `ROLLBACK_SOURCE` - (Rollback only) Which backup was restored

## Workflow Examples

### Standard Deployment
```bash
cd ~/git/keepwatching-client
./scripts/deploy.sh
```

### Deploy and Check Backups
```bash
./scripts/deploy.sh
./scripts/rollback.sh --list
```

### Rollback Process
```bash
# 1. List available backups
./scripts/rollback.sh --list

# 2. Preview the rollback (dry-run)
./scripts/rollback.sh --rollback 2 --dry-run

# 3. Perform the rollback
./scripts/rollback.sh --rollback 2
```

### Emergency Rollback to Previous Version
```bash
# Rollback to the most recent backup (backup #1)
./scripts/rollback.sh --rollback 1
```

## Safety Features

1. **Automatic Backups**: Every deployment creates a backup first
2. **Dry-Run Mode**: Preview rollback changes before applying
3. **Confirmation Prompts**: Rollback requires typing "yes" to proceed
4. **Rollback Backups**: Current state is backed up before rollback
5. **Metadata Tracking**: Full audit trail of all deployments

## Permissions

Scripts require sudo access for:
- Copying files to `/var/www/keepwatching-client`
- Managing backup directory `/var/www/keepwatching-client-backups`

Ensure your user has appropriate sudo permissions.

## Troubleshooting

### No backups found
If `--list` shows no backups, run a deployment first:
```bash
./scripts/deploy.sh
```

### Permission denied
Ensure scripts are executable:
```bash
chmod +x scripts/*.sh
```

### Backup directory doesn't exist
The deployment script creates it automatically on first run. To create manually:
```bash
sudo mkdir -p /var/www/keepwatching-client-backups
```

## Migration from Old Deployment Script

Your old deployment script has been enhanced with backup functionality. The new script is backward compatible and maintains the same deployment flow with added safety features.

**Old script:**
```bash
cd ~/git/keepwatching-client && \
git pull && \
yarn install && \
yarn build && \
sudo cp -r build/* /var/www/keepwatching-client/
```

**New script does the same, plus:**
- Creates backups before deploying
- Tracks git commits
- Enables rollback capability
- Provides detailed logging
- Auto-cleanup old backups

Simply replace your old script with:
```bash
cd ~/git/keepwatching-client
./scripts/deploy.sh
```

## Best Practices

1. **Always use dry-run first** when rolling back:
   ```bash
   ./scripts/rollback.sh --rollback N --dry-run
   ```

2. **Check backups after major deployments**:
   ```bash
   ./scripts/rollback.sh --list
   ```

3. **Keep backup count reasonable** (10 is usually sufficient)

4. **Monitor disk space** in `/var/www/keepwatching-client-backups`

5. **Document major deployments** with descriptive git commit messages

## Additional Notes

- Backups are named: `backup_YYYYMMDD_HHMMSS_<git-commit>`
- Rollback creates a backup named: `backup_YYYYMMDD_HHMMSS_current`
- All operations are logged with timestamps
- Color-coded output for easy reading (green=success, yellow=warning, red=error, blue=info, cyan=dry-run)
