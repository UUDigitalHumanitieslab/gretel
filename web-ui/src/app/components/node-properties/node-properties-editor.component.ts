import { Component, Input, Output, EventEmitter, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { faBan, faCheck, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { SearchVariable, VariableProperty } from '../../services/_index';

export interface AddNodeEvent {
    node: SearchVariable;
    property: string;
}

@Component({
    selector: 'grt-node-properties-editor',
    templateUrl: './node-properties-editor.component.html',
    styleUrls: ['./node-properties-editor.component.scss']
})
export class NodePropertiesEditorComponent implements OnChanges {
    faBan = faBan;
    faCheck = faCheck;
    faPlus = faPlus;
    faTrash = faTrash;

    @ViewChild('propNameField', { static: true })
    propNameField: ElementRef<HTMLInputElement>;

    @Input()
    nodes: SearchVariable[];

    @Input()
    nodeName: string;

    @Output()
    nodesChanges = new EventEmitter<SearchVariable[]>();

    @Output()
    add = new EventEmitter<AddNodeEvent>();

    propName: string;
    propExpression: string;

    constructor() { }

    ngOnChanges() {
        if (!this.nodeName && this.nodes && this.nodes.length) {
            this.nodeName = this.nodes[0].name;
        }
    }

    addNode() {
        this.formatPropName();
        if (!this.propName || !this.propExpression) {
            return;
        }

        const updatedNodes = this.nodes.map(node => node.name !== this.nodeName
            ? node
            : {
                name: node.name,
                path: node.path,
                props: this.addProps(node.props)
            });

        this.nodesChanges.next(updatedNodes);
        this.add.next({
            node: updatedNodes.find(node => node.name === this.nodeName),
            property: this.propName
        });
        this.propName = '';
        this.propExpression = '';

        // focus on the property name field, to allow the user to quickly
        // add a new property
        this.propNameField.nativeElement.focus();
    }

    toggle($event: Event, node: SearchVariable, prop: VariableProperty) {
        $event.preventDefault();
        const updatedNodes = this.nodes.map(n => n.name !== node.name
            ? n
            : {
                name: node.name,
                path: node.path,
                props: node.props.map(p => p.name !== prop.name
                    ? prop
                    : {
                        name: prop.name,
                        enabled: !prop.enabled,
                        expression: prop.expression
                    })
            });
        this.nodesChanges.next(updatedNodes);
    }

    delete($event: Event, node: SearchVariable, prop: VariableProperty) {
        $event.preventDefault();
        const updatedNodes = this.nodes.map(n => n.name !== node.name
            ? n
            : {
                name: node.name,
                path: node.path,
                props: node.props.filter(p => p.name !== prop.name)
            });
        this.nodesChanges.next(updatedNodes);
    }

    private addProps(properties: SearchVariable['props'] = []): SearchVariable['props'] {
        return [
            ...properties.filter(prop => prop.name !== this.propName),
            {
                name: this.propName,
                expression: this.propExpression,
                enabled: true
            }
        ];
    }

    private formatPropName() {
        if (!this.propName) { return; }
        const newName = this.propName.replace(/[ -]/, '_').replace(/(^[_0-9]+|_+$|\W)/g, '');
        if (!newName) { return; }
        // custom properties start with _ to distinguish them from
        // normal properties
        this.propName = '_' + newName;
    }
}
