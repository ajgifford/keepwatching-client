import { ReactComponent as TMDB } from '../../resources/tmdb_long.svg';

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

function TMDBIcon({ width = 96, height = 24, color = 'currentColor' }: IconProps) {
  return <TMDB width={width} height={height} fill={color} />;
}

export default TMDBIcon;
