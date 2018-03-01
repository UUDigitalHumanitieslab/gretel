import {Component, OnInit} from '@angular/core';
import {AlpinoService} from '../../services/alpino.service';

@Component({
  selector: 'app-parse-sentence',
  templateUrl: './parse-sentence.component.html',
  styleUrls: ['./parse-sentence.component.scss']
})
export class ParseSentenceComponent implements OnInit {
  link = '';

  constructor(private alpinoService: AlpinoService) {
  }


  ngOnInit() {
  }

  parseSentence(sentence: HTMLInputElement) {
    this.alpinoService.parseSentence(sentence.value).subscribe((link: string) => {
      console.log(link);
      this.link = link;
    });
    sentence.value = '';
  }

}
