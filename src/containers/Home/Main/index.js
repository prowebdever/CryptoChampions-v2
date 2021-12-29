
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';

import Image from 'components/UI/Image';

const useStyles = makeStyles(theme => ({
  root: {},
  image: {
    borderRadius: theme.spacing(0),
    [theme.breakpoints.down('sm')]: {
    },
  },
  lastGrid: {
    [theme.breakpoints.up('sm')]: {
      marginTop: '0%',
    },
  },
}));

const Main = props => {
  const { className, ...rest } = props;
  const classes = useStyles();

  return (
    <div className={clsx(classes.root, className)} {...rest}> 
      <Grid container>
          <Image
            src="assets/images/main.png"
            alt="A Funding Portal"
            lazy={false}
            className={classes.image}
          />
      </Grid>
    </div>
  );
};

Main.propTypes = {
  /**
   * External classes
   */
  className: PropTypes.string,
};

export default Main;
