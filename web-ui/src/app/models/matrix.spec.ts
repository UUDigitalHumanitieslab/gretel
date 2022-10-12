import { DefaultTokenAttributes, Matrix, TokenAttributes } from './matrix';

describe('Matrix', () => {
    let matrix: Matrix;
    beforeEach(() => {
        matrix = Matrix.default(5);
    });

    it('should set', () => {
        expect(matrix.attributes[0].lemma).toEqual(undefined);
        let changed = matrix.set(0, 'lemma', 'include');
        expect(matrix.attributes[0].lemma).toEqual('include');
        expect(changed).toEqual(true);

        changed = matrix.set(0, 'lemma', 'include');
        expect(changed).toEqual(false);
    });

    it('should handle na', () => {
        let changed = matrix.set(0, 'na', true);
        expect(changed).toEqual(true);
        expect(matrix.attributes[0]).toEqual(<TokenAttributes>{
            rel: undefined,
            word: undefined,
            lemma: undefined,
            pt: undefined,
            cs: false,
            postag: undefined,
            na: true
        });

        changed = matrix.set(0, 'na', false);
        expect(changed).toEqual(true);
        expect(matrix.attributes[0]).toEqual(DefaultTokenAttributes);
    });

    it('should handle case sensitive', () => {
        matrix.set(0, 'cs', true);
        expect(matrix.attributes[0].word).toEqual('include');

        // case-sensitive should be switched off if word is switched off
        matrix.set(0, 'word', undefined);
        expect(matrix.attributes[0].cs).toEqual(false);
        expect(matrix.attributes[0].word).toEqual(undefined);

        // word should be switched on if case-sensitive is switched on
        matrix.set(0, 'cs', true);
        expect(matrix.attributes[0].cs).toEqual(true);
        expect(matrix.attributes[0].word).toEqual('include');

        // case-sensitive is also allowed for exclude
        matrix.set(0, 'cs', false);
        matrix.set(0, 'word', 'exclude');
        matrix.set(0, 'cs', true);
        expect(matrix.attributes[0].word).toEqual('exclude');
    });

    it('setting word, should turn off only na', () => {
        let changed = matrix.set(0, 'na', true);
        expect(changed).toEqual(true);
        expect(matrix.attributes[0]).toEqual(<TokenAttributes>{
            rel: undefined,
            word: undefined,
            lemma: undefined,
            pt: undefined,
            cs: false,
            postag: undefined,
            na: true
        });

        changed = matrix.set(0, 'word', 'include');
        expect(changed).toEqual(true);
        expect(matrix.attributes[0]).toEqual({
            rel: undefined,
            word: 'include',
            lemma: undefined,
            pt: undefined,
            cs: false,
            postag: undefined,
            na: false
        });
    });

    it('setting everything else off, should turn on na', () => {
        expect(matrix.attributes[0].na).toEqual(false);

        matrix.set(0, 'rel', undefined);
        matrix.set(0, 'lemma', undefined);
        matrix.set(0, 'pt', undefined);
        matrix.set(0, 'cs', false);
        matrix.set(0, 'postag', undefined);
        matrix.set(0, 'rel', undefined);
        matrix.set(0, 'word', undefined);

        expect(matrix.attributes[0].na).toEqual(true);
    });
});
