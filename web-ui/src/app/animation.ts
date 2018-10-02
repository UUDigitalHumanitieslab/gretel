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
    yield transition(`* => 0`, slideLeft);
    for (let i = 1; i <= max; i++) {
        for (let j = 0; j < i; j++) {
            yield transition(`${j} => ${i}`, slideRight);
        }
        for (let j = i; j < max; j++) {
            yield transition(`${j} => ${i}`, slideLeft);
        }
    }
    yield transition(`* => ${max}`, slideRight);
}
