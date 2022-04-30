export const COLORS = {
    pink: {
        '100': '#FF80AB',
        '300': '#FF4081',
        '500': '#f40088',
        '700': '#cc0072',
    },
    red: {
        '500': '#EF5350',
        '700': '#D50000',
    },
    orange: {
        '500': '#FF9100',
        '700': '#FF6D00',
    },
    yellow: {
        '500': '#FFC400',
        '700': '#FFAB00',
    },
    lime: {
        '500': '#C6FF00',
        '700': '#AEEA00',
    },
    green: {
        '500': '#00E676',
        '700': '#00C853',
    },
    blue: {
        '500': '#3D5AFE',
        '700': '#304FFE',
    },
    indigo: {
        '500': '#000bef',
        '700': '#0000e0',
    },
    violet: {
        '500': '#D500F9',
        '700': '#AA00FF',
    },
    purple: {
        '500': '#651fff',
        '700': '#4919b7',
    },
    gray: {
        '50': '#f8f8f8',
        '100': '#f2f2f2',
        '200': '#eaeaea',
        '300': '#cccccc',
        '400': '#aaaaaa',
        '500': '#888888',
        '600': '#666666',
        '700': '#444444',
        '800': '#2A2A2A',
        '900': '#111111',
    },
    white: '#FFF',
    black: '#000',
};

export const BREAKPOINT_SIZES = {
    xs: 320,
    sm: 600,
    md: 900,
    lg: 1024,
    xl: 1440,
};

export const BREAKPOINTS = {
    xs: `(max-width: ${BREAKPOINT_SIZES.xs}px)`,
    sm: `(max-width: ${BREAKPOINT_SIZES.sm}px)`,
    md: `(max-width: ${BREAKPOINT_SIZES.md}px)`,
    lg: `(max-width: ${BREAKPOINT_SIZES.lg}px)`,
    xl: `(max-width: ${BREAKPOINT_SIZES.xl}px)`,
    xsMin: `(min-width: ${BREAKPOINT_SIZES.xs + 1}px)`,
    smMin: `(min-width: ${BREAKPOINT_SIZES.sm + 1}px)`,
    mdMin: `(min-width: ${BREAKPOINT_SIZES.md + 1}px)`,
    lgMin: `(min-width: ${BREAKPOINT_SIZES.lg + 1}px)`,
    xlMin: `(min-width: ${BREAKPOINT_SIZES.xl + 1}px)`,
    desktop: `(min-width: ${BREAKPOINT_SIZES.sm + 1}px)`,
};

export const READING_WIDTH = 850;
export const EXTRA_WIDE_WIDTH = 1024;

const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i;

const userAgent =
typeof window !== 'undefined' ? window.navigator.userAgent : 'node';

export const IS_MOBILE_USER_AGENT = mobileRegex.test(userAgent);

export const Z_INDICES = {
    hero: 1,
    mainContent: 10,
    header: 100,
};

export const lerp = (p1, p2, t) => {
    return [(1-t)*p1[0] + t*p2[0], (1-t)*p1[1] + t*p2[1]];
}

export const p1weight = (t) => { return ( -(t**3) + (3*(t**2)) - (3*t)+1 ); }
export const p2weight = (t) => { return ( (3*(t**3)) - (6*(t**2)) + (3*t) )}
export const p3weight = (t) => { return ( (-3*(t**3)) + (3*(t**2)) )}
export const p4weight = (t) => { return (t**3) }

export const getBreakpointFor = windowWidth =>  
    Object.keys(BREAKPOINT_SIZES).find(
        name => windowWidth <= BREAKPOINT_SIZES[name]
    ) || 'xl';
  
export const getDeviceType = breakpoint => {
    if (typeof window === 'undefined') return 'desktop';

    if (!breakpoint) breakpoint = getBreakpointFor(window.innerWidth);

    if (breakpoint === 'xs' || breakpoint === 'sm' || IS_MOBILE_USER_AGENT) return 'mobile'; 
    else return 'desktop';
};
