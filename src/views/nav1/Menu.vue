<template>
  <div>
    <el-date-picker
      v-model="week"
      type="week"
      format="yyyy 第 WW 周"
      placeholder="选择周">
    </el-date-picker>
    <el-button type="primary" @click="dialogFormVisible = true">导入周菜单</el-button>
    <el-dialog class="importWeekDialog" title="请选择要导入的是哪周" :visible.sync="dialogFormVisible">
      <el-form>
         <el-form-item label="日期">
            <el-date-picker
              v-model="week2"
              type="week"
              format="yyyy 第 WW 周"
              placeholder="选择周">
            </el-date-picker>
          </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addWeek">确 定</el-button>
      </div>
    </el-dialog>
    <el-table :data="tableData" stripe border style="width: 100%">
      <el-table-column
        prop="time"
        label="时间"
        width="100">
      </el-table-column>
      <el-table-column prop="Monday" :label="'周一' + '(' + date + ')'">
          <template slot-scope="scope">
            <ul style="margin-left: -36px;">
              <li v-for="(menu, index) in scope.row.Monday">{{menu.MenuName}}<div @click="deleteWeekMenu(date,scope.row.time,menu)" class="icon-delete"></div></li>
            </ul>
          </template>
      </el-table-column>
      <el-table-column prop="Tuesday" :label="'周二' + '(' + GetDateStr(date, 1) + ')'">
          <template slot-scope="scope">
            <ul style="margin-left: -36px;">
              <li v-for="menu in scope.row.Tuesday">{{menu.MenuName}}<div @click="deleteWeekMenu(GetDateStr(date, 1),scope.row.time,menu)"class="icon-delete"></div></li>
            </ul>
          </template>
      </el-table-column>
      <el-table-column prop="Wednesday" :label="'周三' + '(' + GetDateStr(date, 2) + ')'">
        <template slot-scope="scope">
          <ul style="margin-left: -36px;">
            <li v-for="menu in scope.row.Wednesday">{{menu.MenuName}}<div @click="deleteWeekMenu(GetDateStr(date, 2),scope.row.time,menu)"class="icon-delete"></div></li>
          </ul>
        </template>
      </el-table-column>
      <el-table-column prop="Thursday" :label="'周四' + '(' + GetDateStr(date, 3) + ')'">
        <template slot-scope="scope">
          <ul style="margin-left: -36px;">
            <li v-for="menu in scope.row.Thursday">{{menu.MenuName}}<div @click="deleteWeekMenu(GetDateStr(date, 3),scope.row.time,menu)"class="icon-delete"></div></li>
          </ul>
        </template>
      </el-table-column>
      <el-table-column prop="Friday" :label="'周五' + '(' + GetDateStr(date, 4) + ')'">
        <template slot-scope="scope">
          <ul style="margin-left: -36px;">
            <li v-for="menu in scope.row.Friday">{{menu.MenuName}}<div @click="deleteWeekMenu(GetDateStr(date, 4),scope.row.time,menu)"class="icon-delete"></div></li>
          </ul>
        </template>
      </el-table-column>
      <el-table-column prop="Saturday" :label="'周六' + '(' + GetDateStr(date, 5) + ')'">
        <template slot-scope="scope">
          <ul style="margin-left: -36px;">
            <li v-for="menu in scope.row.Saturday" >{{menu.MenuName}}<div @click="deleteWeekMenu(GetDateStr(date, 5),scope.row.time,menu)"class="icon-delete"></div></li>
          </ul>
        </template>
      </el-table-column>
      <el-table-column prop="Sunday" :label="'周日' + '(' + GetDateStr(date, 6) + ')'">
        <template slot-scope="scope">
          <ul style="margin-left: -36px;">
            <li v-for="menu in scope.row.Sunday">{{menu.MenuName}}<div @click="deleteWeekMenu(GetDateStr(date, 6),scope.row.time,menu)"class="icon-delete"></div></li>
          </ul>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import axios from 'axios';
  import qs from 'qs';
  import util from '../../common/js/util'
  export default {
    data () {
      return {
        date: '',
        time: '',
        week: '',
        week2: '',
        tableData: [],
        dialogFormVisible: false,
        listLoading: false,
        pickerOptions0: {
          disabledDate(time) {
            return time.getTime() < Date.now() - 8.64e7;
          }
        },
        menu: [{
          id: 1,
          name:'xxx'
        },{
          id: 2,
          name:'666'
        }],
        demoEvents: [{
          date: '2017/10/15',
          title: '午餐',
          desc: 'longlonglong description'
        },{
          date: '2017/10/15',
          title: '晚餐',
          desc: 'longlonglong description'
        }]
      }
    },
    watch: {
      week(newVal, oldVal) {
        console.log(newVal)
        let vm = this
        vm.tableData = []
        if (newVal != '') {
          let param = {
            "Date": util.formatDate.format(new Date(this.week), "yyyy-MM-dd")
          }
          this.date = util.formatDate.format(new Date(this.week), "yyyy-MM-dd")
          var xmlhttp
          if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
              xmlhttp=new XMLHttpRequest();
          } else {// code for IE6, IE5
              xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
          }
          xmlhttp.onreadystatechange = function(){
            if (xmlhttp.readyState==4 && xmlhttp.status==200) { 
              vm.tableData.push(JSON.parse(xmlhttp.responseText).breakfast)
              vm.tableData.push(JSON.parse(xmlhttp.responseText).lunch)
              vm.tableData.push(JSON.parse(xmlhttp.responseText).dinner)
              vm.tableData.push(JSON.parse(xmlhttp.responseText).midnight)
            }
          }
          xmlhttp.open("POST","http://116.62.66.130/canteen/getWeekMenu.php",false);
          xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
          xmlhttp.send(qs.stringify(param));
        }
      }
    },
    methods: {
      GetDateStr(date, AddDayCount) { 
          var dd = new Date(date); 
          dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期 
          var y = dd.getFullYear(); 
          var m = dd.getMonth()+1;//获取当前月份的日期 
          var d = JSON.stringify(dd.getDate()).length > 1 ? dd.getDate() : '0' + dd.getDate(); 
          return y+"-"+m+"-"+d; 
      },
      getFirstDayOfWeek (date) { 
        var day = date.getDay() || 7; 
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day); 
      },
      deleteWeekMenu (date,time,menu) {
        let eatingTime = -1
        switch (time) {
          case '早餐':
            eatingTime = 1
            break;
          case '午餐':
            eatingTime = 2
            break;
          case '晚餐':
            eatingTime = 3
            break;
          case '夜宵':
            eatingTime = 4
            break;
        }
        let vm = this
        this.$confirm('确认将此菜从该日菜单删除吗?', '提示', {
          type: 'warning'
        }).then(() => {
          let param = qs.stringify({'MenuId': menu.MenuId,'EatingTime':eatingTime,"EatingDate":date})
          this.loadXMLDoc('http://116.62.66.130/canteen/deleteOneMenu.php', param, '')
          this.$message({
            message: '删除成功',
            type: 'success'
          });
          document.location.reload();
        }).catch(() => {

        });
      },
      addWeek () {
        this.listLoading = true
        let param = qs.stringify({
          HistoryDate: util.formatDate.format(new Date(this.week), "yyyy-MM-dd"),
          FutureDate: util.formatDate.format(new Date(this.week2), "yyyy-MM-dd")
        })
        this.loadXMLDoc('http://116.62.66.130/canteen/insertHistoryMenuToFuture.php', param, '')
        if (this.listLoading == false) {
          this.dialogFormVisible = false
          this.week2 = ''
        }
      },
      loadXMLDoc(url, param, data) {
        var xmlhttp;
        let vm = this
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp=new XMLHttpRequest();
        } else {// code for IE6, IE5
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange=function()
          {
          if (xmlhttp.readyState==4 && xmlhttp.status==200)
            { 
              if (data !== '') {
                vm[data] = JSON.parse(xmlhttp.responseText).return_msg
              } else {
                console.log(JSON.parse(xmlhttp.responseText).return_msg)
              }
              this.listLoading = false;
              console.log('xml', this.listLoading)
            }
          }
        xmlhttp.open("POST",url,false);
        xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.send(param);
      }
    },
    created() {
      this.week = this.getFirstDayOfWeek(new Date())
    }
  }

</script>