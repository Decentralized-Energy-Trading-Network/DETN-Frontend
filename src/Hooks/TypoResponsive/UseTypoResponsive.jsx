import { useMediaQuery, useTheme } from '@mui/material';

const useResponsiveTypography = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('xs'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));

  let variant = 'h3';
  if (isXs) {
    variant = 'h6';
  } else if (isSm) {
    variant = 'h3';
  } else if (isMd) {
    variant = 'h4';
  } else if (isLg) {
    variant = 'h2';
  }

  return variant;
};

export default useResponsiveTypography;
