import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // Braced body, no implicit return: newer Chrome versions have window.scrollTo
    // return a Promise instead of undefined. An implicit-return arrow function
    // here would hand that Promise to React as the effect's cleanup ("destroy")
    // function; React stores it and unconditionally calls it as a function the
    // next time this effect's cleanup runs (i.e. on every route change), which
    // throws "TypeError: <x> is not a function" and crashes to the error
    // boundary on every single navigation.
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default ScrollToTop;
