import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { ParseService } from './parse.service';
import { ExtractinatorService } from 'lassy-xpath';

describe('ParseService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ParseService,
                ExtractinatorService
            ]
        });
    });

    it('should be created', inject([ParseService], (service: ParseService) => {
        expect(service).toBeTruthy();
    }));

    it('should parse metadata', waitForAsync(inject([ParseService], async (service: ParseService) => {
        const parsed = await service.parseXml(`<metadata>
        <meta type="text" name="session" value="306_Busverhaalwithout"/>
        <meta type="text" name="charencoding" value="UTF8"/>
        <meta type="text" name="media" value="306_Busverhaal, video"/>
        <meta type="text" name="transcriber" value="Margriet"/>
        <meta type="text" name="speaker" value="CHI"/>
        <meta type="text" name="origutt" value="en eind goed &amp;+alt al goed is hij nu gewoon een bus."/>
        <meta type="text" name="language" value="nld"/>
        <meta type="text" name="corpus" value="change_corpus_later"/>
        <meta type="text" name="age" value="10;11."/>
        <meta type="int" name="months" value="131"/>
        <meta type="text" name="sex" value="male"/>
        <meta type="text" name="group" value="Controle"/>
        <meta type="text" name="role" value="Target_Child"/>
        <meta type="int" name="uttid" value="19"/>
    </metadata>`);
        expect(parsed.metadata[0]).toBeTruthy();
        expect(parsed.metadata[0].meta).toBeTruthy();
        expect(parsed.metadata[0].meta.length).toBe(14);
        expect(parsed.metadata[0].meta[0].$.name).toBe('session');
        expect(parsed.metadata[0].meta[4].$.value).toBe('CHI');
    })));

    it('should parse attribute nodes', waitForAsync(inject([ParseService], async (service: ParseService) => {
        const parsed = await service.parseXml(`<node cat="top"><node varName="$node" cat="">
        <node varName="$node1" rel="su" pt="vnw">
        </node>
        <node varName="$node2" rel="hd" pt="ww">
        </node>
        <node varName="$node3" rel="predc" cat="np">
            <node varName="$node4" rel="det" pt="lid">
            </node>
            <node varName="$node5" rel="hd" pt="n">
            </node>
        </node>
    </node></node>`);
        expect(parsed.node).toBeTruthy();
        expect(parsed.node[0].node).toBeTruthy();
        expect(parsed.node[0].node.length).toBe(1);
        expect(parsed.node[0].node[0].$).toEqual({ varName: '$node', cat: '' });
        expect(parsed.node[0].node[0].node.length).toBe(3);
        expect(parsed.node[0].node[0].node[2].$).toEqual({ varName: '$node3', rel: 'predc', cat: 'np' });
    })));
});
