import { Component, OnInit } from '@angular/core';
import {StepComponent} from "../step.component";

@Component({
  selector: 'grt-sentence-input',
  templateUrl: './sentence-input.component.html',
  styleUrls: ['./sentence-input.component.scss']
})
export class SentenceInputComponent extends StepComponent implements OnInit {

  constructor() {
      super();
  }

    ngOnInit() {
        //Add the moment it is always valid
        this.onChangeValid.emit(true);
    }

  showWarning(){
        this.warning = true;
  }

}
