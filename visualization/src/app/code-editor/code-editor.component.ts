import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewChild
} from '@angular/core';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/merge/merge';
import 'codemirror';
import {DiffPanelValuesService} from "../shared/diff-panel-values.service";

declare const CodeMirror;

@Component({
    selector: 'app-code-editor',
    templateUrl: './code-editor.component.html',
    styleUrls: ['./code-editor.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class CodeEditorComponent implements OnInit {

    private codeMirrorInstance: any;
    private codeMirrorConfiguration: {};

    @ViewChild('codeMirrorElement') codeMirrorElement;

    constructor(private ref: ChangeDetectorRef, private diffPanelValueService: DiffPanelValuesService) {
        this.codeMirrorConfiguration = {
            value: '',
            origLeft: null,
            orig: '',
            lineNumbers: true,
            mode: 'javascript',
            highlightDifferences: true,
            connect: true
        };

    }

    ngOnInit() {
        this.codeMirrorInstance = CodeMirror.MergeView(this.codeMirrorElement.nativeElement, this.codeMirrorConfiguration);
    }

    public setLeftContent() {
        this.codeMirrorInstance.editor().setValue( this.diffPanelValueService.getLeftContent() );
        setTimeout( ()=>this.codeMirrorInstance.editor().refresh(),1);
        this.ref.markForCheck();
    }

    public setRightContent() {
        this.codeMirrorInstance.rightOriginal().setValue( this.diffPanelValueService.getRightContent() );
        setTimeout( ()=>this.codeMirrorInstance.rightOriginal().refresh(),1);
        this.ref.markForCheck();
    }

}
