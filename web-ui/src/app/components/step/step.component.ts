import {Component, EventEmitter, OnInit, Output} from '@angular/core';


@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss']
})
export class StepComponent implements OnInit {

  constructor() {

  }

  @Output() isValid = new EventEmitter<Boolean>();

  ngOnInit() {
  }

  public checkIfValid(){
    throw new Error("checkIfValid not implemented");
  }
  public showWarning(){
    throw new Error("showWarning not implemented");
  }

}
