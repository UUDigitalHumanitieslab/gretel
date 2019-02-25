import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'grt-external-tree-visualizer',
  templateUrl: './external-tree-visualizer.component.html',
  styleUrls: ['./external-tree-visualizer.component.scss']
})
export class ExternalTreeVisualizerComponent implements OnInit {
  public xml: string;
  public sentence: string;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.xml = params['XML'];
      this.sentence = params['sent'];
      if (!this.sentence) {
        this.sentence = 'Unknown sentence';
      }
    })
  }

}
