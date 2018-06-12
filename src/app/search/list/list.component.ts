import { Component, OnInit, Input } from '@angular/core';
import { DatamanageService } from '../../datamanage.service';
import { JsonPipe } from '@angular/common';
import { Router } from '@angular/router';
import { NgProgress } from 'ngx-progressbar';
import { NotificationCenter } from 'ngx-notification-center';
import { MatDialog } from '@angular/material';
import { ConfirmcancelComponent } from './confirmcancel/confirmcancel.component';
import { AjaxService } from '../../ajax.service';
import { Observable } from 'rxjs/observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { ClassBusdata } from 'src/app/classes/classbusdata'
import { error } from 'protractor';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  //searchlist = JSON.parse(JSON.stringify( this._do.filterBus()))

  //searchlist = this._do.filterBus();

  ss = [1, 2];
  //ss1 = Object.create(ss);

  chkseat
  activeid
  seatsarr: any = {};
  myuserid = 1;
  totalamt = 0;
  seatsstr = 'NA'
  gstpercentage

  constructor(private _do: DatamanageService, private _r: Router, private _pb: NgProgress,
    private _n: NotificationCenter, private _dialogue: MatDialog, private _ajax: AjaxService) { }

  searchlist

  ngOnInit() {
    this._pb.start();
    this._ajax.searchBus(this._do.searcbus.frm, this._do.searcbus.to, this._do.searcbus.dateon)
      .subscribe(res => {
        this.searchlist = res;
        this._pb.done();
        console.log(res)
      },
      error=>{
        console.log(error)
      }
    );
    //this.searchlist = ;
    this.myuserid = this._do.loginuser > 0 ? this._do.loginuser : 1;
    this.gstpercentage = this._do.gstpercentage;

    //console.log(this.searchlist);
  }
  CatchErr(er) {
    return Observable.throw(er);
  }
  formatData(res) {
    console.log(res)
    let ss = res["result"].map(this.assignClass)
    return ss;
  }
  assignClass(data) {
    console.log(data)
    let cc = new ClassBusdata();
    cc.id = data.id;
    cc.amt = data.amt;
    cc.frm = data.frm;
    cc.name = data.name;
    cc.on = data.on;
    cc.to = data.to;
    cc.seats = data.seats;
    return cc;
  }
  getStyle() {
    return '#999'
  }
  setasactive(row) {

    //console.log(row);
    if (this.activeid && this.activeid != row.id) {
      let tembus = this.searchlist.find(k => k.id == this.activeid);
      //console.log(tembus.id)
      for (let ii of tembus.seats) {
        ii.selected = false;
      }
    }

    this.activeid = row.id;
    this.chkseat = row;
    this.totalamt = 0;
    this.seatsstr = 'NA'
  }
  //selectSeats(busid){
  //this._do.updateSelectedSeats(busid,this.chkseat);
  //}
  selectSeat(seat) {
    this.seatsarr = this.chkseat.seats.find(k => k.sid == seat);
    if (!this.seatsarr.bookedby) {
      this.seatsarr.selected = this.seatsarr.selected == true ? this.seatsarr.selected = false : this.seatsarr.selected = true;
      if (this.seatsarr.selected) {
        this.totalamt = this.totalamt + this.chkseat.amt;
      } else {
        this.totalamt = this.totalamt - this.chkseat.amt;
      }
    }
    let i = 0;
    for (let ss of this.chkseat.seats) {
      if (ss.selected == true) {
        this.seatsstr = i == 0 ? ss.sid : this.seatsstr + ', ' + ss.sid;
        i++;
      }
    }
    //console.log(this.seatsarr);
  }
  bookseats(busid) {
    this._do.updateSelectedBus(busid);
    this._do.totalprice = this.totalamt;
    //this._do.updateSelectedSeats(this.seatsarr);
    let cnt = this.chkseat.seats.find(k => k.selected == true)
    if (cnt) {
      this._r.navigate(['search/result/book']);
    } else {
      this._n.danger("Please select atleast one seat");
    }
  }
  canceltheseat(busid, seatid) {
    /*let dialogRef = this._dialogue.open(ConfirmcancelComponent);
    dialogRef.componentInstance.sendtoparent(c=>{
      this.confirmcancel('d');
    });*/
    if (confirm("Are you sure to cancel the seat?")) {
      this.seatsarr = this.chkseat.seats.find(k => k.sid == seatid);
      this.seatsarr.selected = false;
      this.seatsarr.bookedby = 0;
    }
  }
  checkSeatscount() {
    let filter11 = this.chkseat.seats.filter(k => k.selected == true);
    //console.log(filter11);
    return filter11.length > 0 ? false : true;
  }
  public confirmcancel(data) {
    alert('kk');
  }
}
