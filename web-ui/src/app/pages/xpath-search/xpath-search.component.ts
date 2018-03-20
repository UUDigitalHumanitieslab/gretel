import { Component, OnInit, ViewChild } from '@angular/core';
import { StepComponent } from "../../components/step/step.component";
import { XpathInputComponent } from "../../components/step/xpath-input/xpath-input.component";
import { Crumb } from "../../components/breadcrumb-bar/breadcrumb-bar.component";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup } from "@angular/forms";
import { SessionService } from "../../services/session.service";


@Component({
    selector: 'app-x-path-search',
    templateUrl: './xpath-search.component.html',
    styleUrls: ['./xpath-search.component.scss']
})
export class XpathSearchComponent implements OnInit {

    constructor(private http: HttpClient, private sessionService: SessionService) {
    }

    //All the components. used to call functions on.
    @ViewChild('xpathInput') xpathInput;
    @ViewChild('selectTreebanks') selectTreebanks;
    @ViewChild('hiddenForm') form;

    currentStep = 1;
    // Should be false: now true for debugging.
    valid = true;

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

    /**
     *  go to next step. Only can continue of the current step is validated.
     */
    next() {

        if (this.valid) {
            // Should be false, for debugging only
            this.valid = true;
            switch (this.currentStep) {
                case 1: {
                    this.goToSelectTreebank();
                    break;
                }
                case 2: {
                    this.goToResultsPhp();
                    break;
                }


            }


        } else {
            this.showWarning()
        }


    }


    /**
     * Adds a variable to the form. Is used add information to the post request when the form is submitted
     * @param name: name for the variable
     * @param value: value of the variable
     * */
    addFormVariable(name: string, value: string) {
        let element = document.createElement('input');
        element.value = value;
        element.name = name;
        this.form.nativeElement.append(element)

    }

    /**
     * Goes to the selection of the treebank.
     * The status of this session must be updated to the server. (php *zucht*)
     * Creates an PID and posts the PID with nodeinformation to the php server
     */
    goToSelectTreebank() {
        let id = this.sessionService.getSessionId();

        const httpOptions = {
            headers: new HttpHeaders({
                'responseType': 'text/html'
            })
        };
        const formData = new FormData();
        formData.append("sid", id);
        formData.append("xpath", this.getXPath());

        // this.http.post("/gretel/xps/tb-sel.php", formData, {responseType: "document"}).subscribe((res) => {
        //   console.log(res.body);
        // });

        this.currentStep += 1;

    }

    /**
     * Goes to the resultsphp page with the selected treebank and subtreebanks
     */
    goToResultsPhp() {
        //TODO: get info from the child component.
        this.addFormVariable("treebank", "test");
        this.addFormVariable("sid", this.sessionService.getSessionId());
        this.addFormVariable("subtreebank[]", "test");
        this.form.nativeElement.submit();

    }


    /**
     * Go back one step
     */
    prev() {
        if (this.currentStep > 1) {
            this.currentStep -= 1;
        }

    }

    /**
     * Sets
     * @param boolean
     */
    setValid(valid: boolean) {
        this.valid = valid;
    }

    /**
     * Show the warning of the appropiate component.
     */
    showWarning() {
        switch (this.currentStep) {
            case 1: {
                this.xpathInput.showWarning();
                break;
            }
            case 2: {
                this.selectTreebanks.showWarning();
                break;
            }


        }

    }

    //Sheean deze invullen a.u.b.
    /**
     * Function that gets the xpath from the xpath input component
     */
    getXPath() {
        return "//node"
    }

}
