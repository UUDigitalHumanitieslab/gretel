import {Component, OnInit, ViewChild} from '@angular/core';
import {StepComponent} from "../../components/step/step.component";
import {XpathInputComponent} from "../../components/step/xpath-input/xpath-input.component";
import {Crumb} from "../../components/breadcrumb-bar/breadcrumb-bar.component";
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FormGroup} from "@angular/forms";
interface Step {
  componentName: string
}


@Component({
  selector: 'app-x-path-search',
  templateUrl: './xpath-search.component.html',
  styleUrls: ['./xpath-search.component.scss']
})
export class XpathSearchComponent implements OnInit {

  constructor(private  http: HttpClient) {
  }

  @ViewChild('xpathInput') xpathInput;
  @ViewChild('hiddenForm') form;

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


  next() {
    if (true) {

      this.valid = false;
      this.currentStep += 1;
      /*
      let xpathElement = document.createElement('input');
      xpathElement.value = `//node`;
      xpathElement.name = "xpath";





      let sidElement = document.createElement('input');
      sidElement.name = "sid";
      sidElement.value = "halloe123";
      this.form.nativeElement.append(
        sidElement
      );
      this.form.nativeElement.append(
        xpathElement
      );
      this.form.nativeElement.submit()
      */
    }
    /*
     else {
     this.showWarning();
     }
     */

  }

  addXpathVariables(){

  }

  proxyIfNeeded() {
    if (this.currentStep == this.stepToProxy) {
      window.location.href = this.proxyLink;
    }
  }

  prev() {
    if (this.currentStep > 1) {
      this.currentStep -= 1;
    }

  }

  setValidState(e) {
    this.valid = e;

  }

  showWarning() {
    if (this.currentStep == 1) {
      this.xpathInput.showWarning();
    }

  }

  /*
   goToTreebanks(){
   const httpOptions = {
   headers: new HttpHeaders({
   'responseType': 'text/html'
   })
   };
   const formData = new FormData();
   formData.append("sid", "1");
   this.http.post("/gretel/xps/tb-sel.php?sid=1", formData, {responseType: "document"}).subscribe((res)=>{
   console.log(res.body);
   })

   }
   */


}
