import { badwordManage } from './antibadword.js';

export default {
    name: 'removebadword',
    aliases: ['unflagword', 'rbw', 'removeword', 'delbadword'],
    description: 'Remove a custom bad word from this group. Usage: .removebadword <word>',
    run: (context) => badwordManage(context, 'remove')
};
