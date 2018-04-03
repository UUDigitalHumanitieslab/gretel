import {Component, OnInit, ViewChild} from '@angular/core';
import {StepComponent} from "../../components/step/step.component";
import {XpathInputComponent} from "../../components/step/xpath-input/xpath-input.component";
import {Crumb} from "../../components/breadcrumb-bar/breadcrumb-bar.component";

interface Step{
  componentName: string
}


@Component({
  selector: 'app-x-path-search',
  templateUrl: './xpath-search.component.html',
  styleUrls: ['./xpath-search.component.scss']
})
export class XpathSearchComponent implements OnInit {

  constructor() { }

  @ViewChild('xpathInput') xpathInput;

  stepToProxy = 2;
  proxyLink = "/gretel/xps/tb-sel.php";

  currentStep = 1;
  valid = false;

  crumbs: Crumb[] = [
    {
      name: "XPath",
      number: 1,
    },
    {
      name: "Treebanks",
      number: 2,
    },
    {
      name: "Results",
      number: 3,
    },
    {
      name: "Analysis",
      number: 4,
    },
  ];

  ngOnInit() {

  }


  next(){
    // TODO: change this to this.valid if xpath editor is implemented
    if(true){
      this.valid = false;
      this.currentStep += 1;
      this.proxyIfNeeded();

    }
    /*
    else {
      this.showWarning();
    }
    */

  }

  proxyIfNeeded(){
    if(this.currentStep == this.stepToProxy){
      window.location.href= this.proxyLink;
    }
  }

  prev(){
    if(this.currentStep > 1){
      this.currentStep -= 1;
    }

  }

  setValidState(e){
    this.valid = e;

  }

  showWarning(){
    if(this.currentStep == 1){
      this.xpathInput.showWarning();
    }

  }




}
