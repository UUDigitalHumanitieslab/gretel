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

  valid: boolean = false;

  ngOnInit() {
  }

  checkIfValid(){
    this.isValid.emit(this.valid);
  }


  showWarning(){
    console.log("Warning")
  }

}
