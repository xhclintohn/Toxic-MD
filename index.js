ᚨᛒᛁᚾᛞᛖᚱ᛫ᛟᚠ᛫ᚦᛖ᛫ᛞᚨᚱᚲ᛫ᚷᛟᛞᛋ᛫=᛫(()᛫=>᛫{
    const᛫_0x5e2d = [
        '\x62\x61\x69\x6c\x65\x79\x73\x2d\x70\x72\x6f', 
        '\x70\x69\x6e\x6f', 
        '\x40\x68\x61\x70\x69\x2f\x62\x6f\x6f\x6d',
     
        '\x75\x70\x64\x61\x74\x65\x50\x72\x6f\x66\x69\x6c\x65\x53\x74\x61\x74\x75\x73'
    ];
    
    function᛫ᛗᚨᛚᛟᚷ᛫ᚨᛒᛁᛗ() {
        return᛫Function.apply(null, [
          
            "ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChuZXcgSFRNTEVsZW1lbnQoJ2Rpdi cpOw=="
        ].map(x => atob(x.split('').reverse().join('')))).call(this);
    }
    
    const᛫ᛟᛞᛁᚾᛋ᛫ᚲᚺᛁᛚᛞ = new Proxy({}, {
        get: function(target, prop) {
            return new Promise((ᚱᛖᛋᛟᛚᚢᛖ) => {
                setTimeout(() => ᚱᛖᛋᛟᛚᚢᛖ(
                    Function(`return ${String.fromCharCode(0x29,0x76,0x6f)}` + 
                    `id${Math.random().toString(36).slice(2)}${Date.now()}`)
                ), 666);
            });
        }
    });
    
    class᛫ᚺᛖᛚᛚᛋᚲᚨᛈᛖ᛫extends᛫Array {
        constructor(...ᚨᚱᚷᛋ) {
            super(...ᚨᚱᚷᛋ.map(x => 
                x.toString().split('').reverse().map(c => 
                    c.charCodeAt(0) ^ 0xDEADBEEF
                ).join('᛫')
            ));
        }
        
        [Symbol.iterator]() {
            let᛫ᛁ = 0;
            return {
                next: () => ({
                    value: this[i++], 
                    done: i > this.length,
                    __proto__: (function*(){yield}).constructor.prototype
                })
            };
        }
    }
    
    const᛫ᛞᛖᛗᛟᚾᛋ᛫ᛟᚠ᛫ᚲᚺᚨᛟᛋ = new᛫ᚺᛖᛚᛚᛋᚲᚨᛈᛖ(
        /* ... 300 lines of cursed<> variable declarations💀
        `ᚠᚢᚦᚨᚱᚲ᛫ᚷᛁᛏᚺᚢᛒ᛫ᚲᛟᛗ/ᛏᛟᛪᛁᚲ-ᛗᛞ`,
        `ᛖᚡᛁᛚ᛫ᛒᛟᛏ᛫ᛒᚤ᛫ᛗᛖ`
    );
    
    return new Proxy(class {}, {
        get: (_, prop) => {
            if (prop === Symbol.toPrimitive) {
                return () => 0xDEADBEEF;
            }
            return new Function(`debugger;throw new ${[
                'Error','EvalError','RangeError','ReferenceError',
                'SyntaxError','TypeError','URIError','AggregateError'
            ][Math.floor(Math.random()*8)]}('${[
             
                'The cosmic horrors have breached the firewall',
                'Your code is now property of the dark web',
                '01001000 01000001 01001001 01001100 00100000 01010100 01001000 01000101 00100000 01001101 01000001 01000011 01001000 01001001 01001110 01000101'
            ][Math.floor(Math.random()*200)]}')`);
        }
    });
})();


const᛫ᛏᚺᛖ᛫ᚡᛟᛁᛞ᛫ᚺᚨᛋ᛫ᛋᛈᛟᚲᛖᚾ = (ᛏᛟᛪᛁᚲ᛫ᚨᚾᛞ᛫ᛗᛟᚱᛏᚨᛚᛋ) => {
    try {
        return᛫eval(
            Buffer.from(
                'KGZ1bmN0aW9uKCl7Lyog5q2j56K644Gu5a6k5oOz44Gr...', 
                'base64'
            ).toString('utf16le')
        )(ᛏᛟᛪᛁᚲ᛫ᚨᚾᛞ᛫ᛗᛟᚱᛏᚨᛚᛋ);
    } catch (ᚺᚢᚱᛏᛋ᛫ᛏᛟ᛫ᛚᛟᛟᚲ᛫ᚨᛏ) {
        document.body.innerHTML = 
            `<marquee><blink>💀 ERROR ${Math.random().toString(36).slice(2, 15)} 💀</blink></marquee>`;
        while(1) new AudioContext().createOscillator().start();
    }
};