import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientsComponent } from 'src/app/components/clients/clients.component';
import { Client } from 'src/app/models/client.model';
import { Invoice } from 'src/app/models/invoice.model';
import { Product } from 'src/app/models/product.model';
import { SaleDetail } from 'src/app/models/sale-detail.model';
import { Supplier } from 'src/app/models/supplier.model';
import { ApiHelperService } from 'src/app/services/ApiHelper.service';
import { TableColumn } from '../table/table.component';
// import { DisplayModalComponent } from '../modal/displayModal.component';

@Component({
  selector: "app-add-edit",
  templateUrl: "./add-edit.component.html",
  styleUrls: ["./add-edit.component.scss"],
})
export class AddEditComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private apiHelper: ApiHelperService,
    private actroute: ActivatedRoute,
    private router: Router,
    private location :Location
    ) {}
    
  @Input() displayItem: Product | Client | Supplier | Invoice = null;
  // @Input() displayItem: Invoice = null;
    
  Title: string = "NO-ID";
  itemProperties;
  itemFormArray = this.fb.array([]);
  formControlsArray = [];
  itemform = this.fb.group({});
  labelstext = [];
  selectValue = false;
  selectInputData: any;
  selectInputValue: any;
  previousRoute: string;
  saledetailscolumns: TableColumn[];
  saleDetailsData ;
  hasSailDetails: boolean = false;
  isSaleDetails: boolean = false; 

  currentItemId: number;

  subTotal: number;
  tax :number;
  total:number;
  // autoCompleteValue: any;

  ngOnInit(): void {
    
    
    //console.log(Object.entries(this.displayItem));
    //this.displayItem = this.data.map((value) => String(value));
    // console.log("this.displayItem.constructor.name", this.displayItem.constructor.name );
    // console.log("Object.keys(this.displayItem)", Object.keys(this.displayItem));
    // console.log("Object.keys(Product)", Object.keys(new Product()));
    // const newINvoive = new Invoice();
    // const invoiceTestType =  newINvoive;
    // console.log("typeof newINvoive", newINvoive.constructor.name);
    // console.log(
    //   "typeof invoiceTestType", invoiceTestType.constructor.name
    // );
    
    // console.log("typeof true",typeof true)

    
    // console.log("this.route.snapshot.params.id", this.route.snapshot.params);

    
    this.actroute.params.subscribe(params => {
      // console.log("params", params);

      this.previousRoute = params[""];
      
      if (+params['id'] === 0) {
        this.displayItem = this.apiHelper.InitializeType(params[""]);
      } else {
        this.displayItem = this.apiHelper.getByID(params[""],+params["id"]);
      }

      if(params[""] === "saleDetails"){
        this.isSaleDetails = true
      }

      this.currentItemId = +params["id"]

    })

    console.log("this.displayItem", this.displayItem); 
    // console.log("Object.values(this.displayItem)", Object.values(this.displayItem));

    // console.log(new Client({id:"1"}));

   
    // console.log("this.route.snapshot.data", this.route);
    
    // const itemIndex :string =  this.route.snapshot.paramMap.get("item")
    
    // if (isNaN(+itemIndex)) {
    //   this.displayItem = this.apiHelper.InitializeType(itemIndex);
    // } else {
    //   this.displayItem = this.apiHelper.getInvoiceById(itemIndex);
    // }
      
    // console.log("this.displayItem", this.displayItem);

    if (this.displayItem.id != undefined) {
      if (this.displayItem.id == 0) {
        this.Title = `Add new ${this.displayItem.constructor.name}`;
      } else {
        this.Title = `Editing ${this.displayItem.constructor.name}  ${this.displayItem.id}`;
      }
    } else {
      this.Title = "Id was not found";
    }
    this.itemProperties = Object.keys(this.displayItem).map((prop) => {
      // this.labelstext.push({labelsText: this.formatText(prop), formControlName: prop});

      // this.itemFormArray.push(this.fb.control(''));
      // this.itemFormArray.

      let isBoolean = false;
      let needSelectInput = false;
      let needDatePicker = false;
      if (this.displayItem[prop] === true || this.displayItem[prop] === false) {
        isBoolean = true;
        //this.itemform.controls[prop].setValue((this.displayItem[prop]?  'true' : 'false'));
        this.itemform.addControl(
          prop,
          new FormControl(this.displayItem[prop].toString())
        );
      } else {
        if (prop.includes("client")) {
          needSelectInput = true;
          // console.log("this.displayItem in need select input", this.displayItem);
          // console.log("this.displayItem[prop] in need select input BEFORE ASSIGNING IT", this.displayItem[prop]);
          this.selectInputData = this.apiHelper.getClients();
          // console.log("this.selectInputData", this.selectInputData);
          
          if (this.displayItem[prop]["id"] !== ""){
            this.displayItem[prop] = this.selectInputData.find(cl => cl.id === this.displayItem[prop]["id"]);
          }
          // console.log("this.selectInputData.find(cl => cl.id === this.displayItem[prop] )", this.selectInputData.find(cl => cl.id === this.displayItem[prop]?.id));
          // console.log("this.displayItem[prop] in need select input", this.displayItem[prop]);
          // console.log("prop", prop);
          
        }

        if (prop.toLowerCase().includes("date")) {
          needDatePicker = true;
          this.itemform.addControl(
            prop,
            new FormControl(new Date(this.displayItem[prop]))
          );
        } else {
          this.itemform.addControl(
            prop,
            new FormControl(this.displayItem[prop])
          );
        }
      }






      // console.log(`${prop} string Length ${prop.length}`);
      // console.log(` string Length ${this.displayItem[prop].length}`);

      // if (
      //   this.displayItem[prop] != null ||
      //   this.displayItem[prop] != undefined
      // ) {
      //   String(this.displayItem[prop]);
      // }

      let needTextArea = false;
      if (prop === "description" || this.displayItem[prop]?.length > 20) {
        needTextArea = true;
      }

      let width: string = "";

      switch (prop) {
        case "firstName":
          width = "350";
          break;

        case "lastName":
          width = "50";
          break;

        default:
          width = "100";
          break;
      }

      this.saledetailscolumns = [
        {
          name: "Product Name",
          dataKey: "productName",
          isSortable: true,
          isFilterable: true,
          position: "right"
        },
        {
          name: "Description",
          dataKey: "description",
          isFilterable: true,
        },
        {
          name: "Quantity",
          dataKey: "quantity",
          isSortable: true,
          isFilterable: true,
        },
        {
          name: "Unit Price",
          dataKey: "unitPrice",
          isSortable: true,
          isFilterable: true,
        },
        {
          name: "Total Price",
          dataKey: "totalPrice",
          isFilterable: false,
        }
  
      ]

      
      let needTable = false;
      if(prop === "saleDetails"){
        needTable = true;
        
        // console.log("this.displayItem[prop]",this.displayItem[prop]);
        // Object.keys(this.displayItem[prop])

        // this.saledetailscolumns.map(col => {
        //   col.name = this.displayItem[prop]
        // })
        this.saleDetailsData = this.displayItem[prop];
        

        console.log("this.saleDetailsData",this.saleDetailsData);
        
        if(this.saleDetailsData.length === 1){
          this.subTotal = this.saleDetailsData[0].totalPrice
          this.tax = this.saleDetailsData[0].tax
        }else{


          this.subTotal = this.saleDetailsData.reduce((previousValue,currentValue,index) => {
            // console.log("previousValue",previousValue);
            // console.log("currentValue",currentValue);
            
            return previousValue + currentValue.totalPrice
            
          }, 0)

          this.tax = this.saleDetailsData.reduce((previousValue,currentValue) => {
            return previousValue + currentValue.tax
          },0)

        }
        

        

        this.total = this.subTotal 


        

        if(this.saleDetailsData.length > 0){
          this.hasSailDetails = true;
        }


        
      }


      // this.formControlsArray.push({this.itemform. : this.fb.control("")});
      return {
        labelsText: this.formatText(prop),
        formControlName: prop,
        value: this.displayItem[prop],
        isBoolean: isBoolean,
        needTextArea: needTextArea,
        needSelectInput: needSelectInput,
        needDatePicker: needDatePicker,
        needTable: needTable,
        width: width,
      };
    });
    console.log("this.itemProperties", this.itemProperties);

    // console.log(this.itemFormArray);
    // console.log(`Item Propertes ${JSON.stringify(this.itemProperties)}`);
    // console.log(this.formControlsArray);

    // this.itemform = this.fb.group({ itemFormArray: this.itemFormArray });

    // console.log("this.itemform.controls.client", this.itemform.controls.client);
    // console.log("this.itemform", this.itemform);
    // console.log("this.selectInputData", this.selectInputData);

    // document.documentElement.style.setProperty("--grd_col", "span 2");

    


    // console.log("this.itemform",this.itemform);
    
  }

  onSubmit() {
    // let submitted = this.formatDate(this.itemform.value);
    // // console.log("this.itemform.value", this.itemform.value);
    // console.log("submitted", submitted);
    // // console.log("this.itemform.value",this.itemform.value);
    // let aRecord = this.apiHelper.InitializeType(this.previousRoute)
    // Object.keys(aRecord).forEach(key => {
    //   aRecord[key] = this.itemform.value[key]
    // })
    // this.apiHelper.saveRecord(aRecord);
    // this.router.navigate([`./${this.previousRoute}`]);
    const invoiceId = +this.actroute.snapshot.url[1].path
    const invoices = this.apiHelper.getInvoices()
    let invoiceToUpdate = invoices.find(inv => inv.id == invoiceId)
    
    console.log("this.itemform.value",this.itemform.value);
    if(this.isSaleDetails){
      console.log("this.actroute",this.actroute);
      console.log("invoiceId",invoiceId);
      console.log("invoiceToUpdate",invoiceToUpdate);

      if(invoiceToUpdate.saleDetails){
        invoiceToUpdate.saleDetails.push(new SaleDetail({
          id : ++invoiceToUpdate.saleDetails.length,
          description : this.itemform.value.description,
          productName : this.itemform.value.this.itemform.value,
          quantity : this.itemform.value.quantity,
          tax : this.itemform.value.tax,
          totalPrice : this.itemform.value.totalPrice,
          unitPrice : this.itemform.value.unitPrice
        }))
        console.log("invoiceToUpdate",invoiceToUpdate);
      }else{
        invoiceToUpdate.saleDetails = (new SaleDetail({
          id : 1,
          description : this.itemform.value.description,
          productName : this.itemform.value.productName,
          quantity : this.itemform.value.quantity,
          tax : this.itemform.value.tax,
          totalPrice : this.itemform.value.totalPrice,
          unitPrice : this.itemform.value.unitPrice
        }))
      }

      console.log("invoiceToUpdate",invoiceToUpdate);
      
    }

  }

  formatText(text: string) {
    text =
      text[0].toLocaleUpperCase() +
      text.replace(/([a-z])([A-Z])/g, "$1 $2").slice(1);
    return text;
  }

  displayFn(client: Client): string {
    console.log(client);
    
    return client && client.firstName ? `${client.firstName} ${client.lastName}` : "";
  }

  //this methos is for getting the type of the object injected into this class
  //to dinamically change the material dialoge title
  getType(object) {
    // Object.keys(object).
  }

  Cancel(){
    this.location.back();
  }

  AddClient() {
    const newClient = new Client();

    // this.dialog
    //   .open(DisplayModalComponent, {
    //     data: newClient,
    //     panelClass: "DisplayModal",
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (!this.objectHasEmptyProperties(res)) {
    //       this.itemform.controls.client.setValue(res);
    //       // this.autoCompleteValue = res;
    //     }
    //   });
  }

  autoCompleteIsEmpty(prop): boolean {
    if (prop.formControlName !== "client") {
      return;
    } else {
      let formControlValue = this.itemform.get(prop.formControlName).value;
      if (typeof formControlValue === "object" && formControlValue !== null) {
        return this.objectHasEmptyProperties(formControlValue);
      }
    }
  }

  resetAutoComplete(prop) {
    this.itemform.get(prop.formControlName).setValue({});
  }

  objectHasEmptyProperties(object) {
    if (Object.values(object).every((x) => x === null || x === "" || x === undefined)) {
      return true;
    } else {
      return false;
    }
  }

  edit(event){

  }

  delete(event){

  }

  formatDate(object){
    if(Object.keys(object).forEach)
     Object.keys(object).map(prop => {
      if (prop.toLowerCase().includes("date")) {
        object[prop] = new Date(object[prop]).toDateString()
      }
    })
    return object;
  }
}