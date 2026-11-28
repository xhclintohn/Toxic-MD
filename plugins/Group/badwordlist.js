import { badwordManage } from './antibadword.js';

export default {
    name: 'badwordlist',
    aliases: ['badwords', 'listbadwords', 'bwlist'],
    description: 'List this group\'s custom bad words.',
    run: (context) => badwordManage(context, 'list')
};
