import { badwordManage } from './antibadword.js';

export default {
    name: 'addbadword',
    aliases: ['flagword', 'abw', 'addword', 'newbadword'],
    description: 'Add a custom bad word to this group. Usage: .addbadword <word>',
    run: (context) => badwordManage(context, 'add')
};
