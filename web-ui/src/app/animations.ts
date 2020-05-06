import { trigger, style, transition, animate, state, group, sequence, keyframes } from '@angular/animations';

export type showState = 'hide' | 'show';

export const animations = [
    trigger('slideDown', [
        state(
            '*',
            style({
                height: '*',
                opacity: 'inherit',
                overflow: 'inherit'
            })),
        state('void',
            style({
                height: '0',
                opacity: '0',
                'padding-top': 0,
                'padding-bottom': 0,
                overflow: 'hidden'
            })),
        transition(
            'void => *',
            group([
                animate('300ms ease-in-out'),
                animate('300ms steps(1,end)', style({ overflow: 'inherit' }))
            ])
        ),
        transition(
            '* => void',
            [
                style({ overflow: 'hidden' }),
                animate('300ms ease-out')
            ]
        )
    ]),
    trigger('fade', [
        state('*', style({
            opacity: '*'
        })),
        state('void', style({
            opacity: '0'
        })),
        transition('* => void', [
            animate('0.2s')
        ]),
        transition('void => *', [
            animate('0.2s')
        ]),
    ])
];
