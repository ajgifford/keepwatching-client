export const parseLocalDate = (dateString) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateString);
};

export const getProfileImageUrl = (image, staticUrl) => {
  if (!image) return `${staticUrl}/default-profile.png`;
  if (image.startsWith('http')) return image;
  return `${staticUrl}${image}`;
};

export const buildTMDBImagePath = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/w500${path}`;
};

export default {
  parseLocalDate,
  getProfileImageUrl,
  buildTMDBImagePath,
};
