export default {
  getProfileImageUrl: (image, staticUrl) => {
    if (!image) return `${staticUrl}/default-profile.png`;
    if (image.startsWith('http')) return image;
    return `${staticUrl}${image}`;
  },
  buildTMDBImagePath: (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w500${path}`;
  },
};