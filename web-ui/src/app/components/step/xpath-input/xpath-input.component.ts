import { Component, OnInit } from '@angular/core';
import {StepComponent} from "../step.component";

@Component({
  selector: 'app-xpath-input',
  templateUrl: './xpath-input.component.html',
  styleUrls: ['./xpath-input.component.scss']
})
export class XpathInputComponent extends StepComponent implements OnInit {

  constructor() {
    super();
  }

  valid: boolean = true;

  ngOnInit() {
      console.log('init');
      //Add the moment it is always valid
      this.onChangeValid.emit(true)
  }

  checkIfValid(){
    this.onChangeValid.emit(true);
  }


  showWarning(){
    console.log("Warning")
  }

}
