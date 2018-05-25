import { Component } from '@angular/core';


@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.css']
})
export class ModalDialogComponent {

    public visible = false;
    public visibleAnimate = false;

    public show(): void {
        this.visible = true;
        this.visibleAnimate = true;
    }

    public hide(): void {
        this.visibleAnimate = false;
        this.visible = false;
    }

    public onContainerClicked(event: MouseEvent): void {
        if ((<HTMLElement>event.target).classList.contains('modal')) {
            this.hide();
        }
    }

}
