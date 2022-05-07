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
    palette: {
        black: '#0A1929',
        cyan: '#44FFD2',
        lightCyan: '#A1FFE9',
        orange: '#FF6B35',
        red: '#ff0000',
        yellow: '#ffff00',
        green: '#00ff00',
        blue: '#00ccff'
    }
};

/** 
 * pSBC(0.2, c0) => make c0 20% lighter
 * pSBC(-0.2, c0) => make c0 20% darker
 * pSBC ( 0.75, c0, c1 ); => c0 + c1 + 75% Blend 
 * https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)
 * 
 * @param {float} p -1 < p < 1; -1 -> 0 is darker, 0 -> 1 is lighter
 * @param {string} c0 first color (accepts RGB and Hex)
 * @param {string} c1 second color (accepts RGB and Hex)
 * @param {boolean} l log scaling (default on) (bool, turn on/off, uses linear if off)
*/
export const scaleColor=(p,c0,c1,l)=>{
    let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)==="string";
    if(typeof(p)!=="number"||p<-1||p>1||typeof(c0)!=="string"||(c0[0]!=='r'&&c0[0]!=='#')||(c1&&!a))return null;
    let pSBCr=(d)=>{
        let n=d.length,x={};
        if(n>9){
            [r,g,b,a]=d=d.split(",");n=d.length;
            if(n<3||n>4)return null;
            x.r=i(r[3]==="a"?r.slice(5):r.slice(4));x.g=i(g);x.b=i(b);x.a=a?parseFloat(a):-1;
        }else{
            if(n===8||n===6||n<4)return null;
            if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
            d=i(d.slice(1),16);
            if(n===9||n===5) {x.r=(d>>24)&255;x.g=(d>>16)&255;x.b=(d>>8)&255;x.a=m((d&255)/0.255)/1000;}
            else {x.r=d>>16;x.g=(d>>8)&255;x.b=d&255;x.a=-1}
        }return x};
    h=c0.length>9;h=a?c1.length>9?true:c1==="c"?!h:false:h;f=pSBCr(c0);P=p<0;t=c1&&c1!=="c"?pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1};p=P?p*-1:p;P=1-p;
    if(!f||!t)return null;
    if(l){r=m(P*f.r+p*t.r);g=m(P*f.g+p*t.g);b=m(P*f.b+p*t.b);}
    else {r=m((P*f.r**2+p*t.r**2)**0.5);g=m((P*f.g**2+p*t.g**2)**0.5);b=m((P*f.b**2+p*t.b**2)**0.5);}
    a=f.a;t=t.a;f=a>=0||t>=0;a=f?a<0?t:t<0?a:a*P+t*p:0;
    if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
    else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}

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
