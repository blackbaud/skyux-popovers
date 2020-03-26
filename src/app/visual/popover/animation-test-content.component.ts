import {
  Component, Input, ChangeDetectorRef, AfterViewInit, OnInit, SimpleChanges, OnChanges
} from '@angular/core';

import { trigger, state, style, transition, animate, AnimationEvent } from '@angular/animations';

type MyAnimationState = 'open' | 'closed';

@Component({
  selector: 'animation-test-content',
  template: `<div
  style="padding:40px;background-color:black;color:white;"
  [@openClose]="animationState"
  (@openClose.start)="onAnimationEvent($event)"
  (@openClose.done)="onAnimationEvent($event)"
><ng-container #target></ng-container></div>`,
  animations: [
    trigger('openClose', [
      state('void', style({
        opacity: 0
      })),
      state('open', style({
        opacity: 1
      })),
      state('closed', style({
        opacity: 0
      })),
      transition('void => *', [
        animate('250ms')
      ]),
      transition('open => closed', [
        animate('250ms')
      ]),
      transition('closed => open', [
        animate('500ms')
      ])
    ])
  ]
})
export class AnimationTestContentComponent implements OnInit, AfterViewInit, OnChanges {

  @Input()
  public set isOpen(value: boolean) {
    console.log('set isOpen:', value);
    this._isOpen = value;
    this.changeDetector.markForCheck();
  }

  public get isOpen(): boolean {
    return this._isOpen || false;
  }

  public get animationState(): MyAnimationState {
    return this.isOpen ? 'open' : 'closed';
  }

  private _isOpen: boolean;

  constructor(
    private changeDetector: ChangeDetectorRef
  ) {
    console.log('constructor()');
  }

  public ngOnInit(): void {
    console.log('OnInit()');
  }

  public ngAfterViewInit(): void {
    console.log('AfterViewInit()');
  }

  public ngOnChanges(changes: SimpleChanges): void {
    console.log('OnChanges()', changes);
  }

  public onAnimationEvent(event: AnimationEvent): void {
    console.log('onAnimationEvent()', event.phaseName, event.fromState, event.toState);
  }

  public toggle(): void {
    this.isOpen = !this.isOpen;
  }

}
