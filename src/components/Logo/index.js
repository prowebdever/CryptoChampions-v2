
import ClimbImage from 'components/ClimbImage';

const sources = [
  {
    srcSet: '/assets/logo/logo.png 600w, /assets/logo/logo.png 960w, /assets/logo/logo.png 1280w',
    type: 'image/png'
  },
  {
    srcSet: '/assets/logo/logo.png 600w, /assets/logo/logo.png 960w, /assets/logo/logo.png',
    type: 'image/png'
  }
];

const Logo = props => (
  <ClimbImage
    {...props}
    width={44}
    height={44}
    sources={sources} />
);

export default Logo;
