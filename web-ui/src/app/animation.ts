import { animate, animateChild, group, query, style, transition, trigger } from '@angular/animations';

export const slideLeft = [
    style({ position: 'relative' }),
    query(':enter, :leave', [
        style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%'
        })
    ], { optional: true }),
    query(':enter', [
        style({ left: '100%', opacity: 0 })
    ], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
        query(':leave', [
            animate('200ms ease-out', style({ left: '-100%', opacity: 0 }))
        ], { optional: true }),
        query(':enter', [
            animate('300ms ease-out', style({ left: '0%', opacity: 1 }))
        ], { optional: true })
    ]),
    query(':enter', animateChild(), { optional: true }),
];

export const slideRight = [
    style({ position: 'relative' }),
    query(':enter, :leave', [
        style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%'
        })
    ], { optional: true }),
    query(':enter', [
        style({ left: '-100%', opacity: 0 })
    ], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
        query(':leave', [
            animate('200ms ease-out', style({ left: '100%', opacity: 0 }))
        ], { optional: true }),
        query(':enter', [
            animate('300ms ease-out', style({ left: '0%', opacity: 1 }))
        ], { optional: true })
    ]),
    query(':enter', animateChild(), { optional: true }),
];

export const slideInAnimation =
    trigger('routeAnimations', Array.from(createTransitions(4)));

function* createTransitions(max: number) {
    for (let to = 0; to <= max; to++) {
        for (let from = 0; from < to; from++) {
            yield transition(`${from} => ${to}`, slideRight);
        }
        for (let from = to; from <= max; from++) {
            yield transition(`${from} => ${to}`, slideLeft);
        }
    }
}
