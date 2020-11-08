import { createMuiTheme } from '@material-ui/core/styles';
import createBreakpoints from "@material-ui/core/styles/createBreakpoints";
import '../font/font.css';

const breakpoints = createBreakpoints({});
const defaultTheme = createMuiTheme({
  overrides: {
    //The CSSBaseline present in all files
    MuiCssBaseline: {
      '@global': {
        html: {
          [breakpoints.up('xs')]: {
            fontSize: '0.9rem'
          },
          [breakpoints.up('lg')]: {
            fontSize: '1.2rem',
          },
          [breakpoints.up('xl')]: {
            fontSize: '1.8rem'
          },
        },
      },
    },
  },
  typography: {
    fontFamily: [
      'websiteFont',
    ]
  },
  palette: {
    primary: {
        light: '#7986cb',
        main: '#3f51b5',
        dark: '#303f9f'
    },
    secondary: {
      main: '#f50057',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#fff',
    },
  },
});

// const { breakpoints, typography: { pxToRem } } = defaultTheme;

// const theme = {
//   ...defaultTheme,
//   overrides: {
//     MuiTypography: {
//       h1: {
//         fontSize: "5rem",
//         [breakpoints.down("xs")]: {
//           fontSize: "3rem"
//         }
//       }
//     }
//   }
// }

export default defaultTheme;

