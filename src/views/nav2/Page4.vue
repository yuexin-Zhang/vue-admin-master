<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="checkUserName" placeholder="员工名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="checkUserMealData(checkUserName)">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <div class="user-list">
        <el-button :key="user.EmployeeId" v-for="user in userData" @click="getUserMealData(user)">{{user.EmployeeName}}</el-button>
        <el-alert v-if="!hasSelectedUser"
          title="没有匹配用户，请重新查询"
          type="warning"
          show-icon>
        </el-alert>
    </div>
    <el-tag v-if="hasSelectedUser">【{{selectedUser.EmployeeName}}】{{year}}年就餐汇总</el-tag>
    <a class="export-btn" type="info" @click="exportToExcel">导出成excel</a>
    <!--列表-->
    <el-table :data="userMealData" highlight-current-row v-loading="listLoading" style="width: 100%;" id="userMealTable">
        <el-table-column prop="month" label="月份" width="100">
        </el-table-column>
        <el-table-column prop="breakfastCount" label="早餐数">
        </el-table-column>
        <el-table-column prop="lunchCount" label="中餐数">
        </el-table-column>
        <el-table-column prop="dinnerCount" label="晚餐数">
        </el-table-column>
        <el-table-column prop="totalCount" label="总餐数">
        </el-table-column>
    </el-table>
    
  </section>
</template>

<script>
  import axios from 'axios';
  import qs from 'qs';
  import util from '../../common/js/util'
  //import NProgress from 'nprogress'
  import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';

  export default {
    data() {
      return {
        ip:util.ip,
        listLoading: false,
        allUserData:[],
        userData: [],
        userMealData: [],
        checkUserData:[],
        checkUserName:'',
        total: 0,
        page: 1,
        selectedUser:{},
        hasSelectedUser: true,
        year: ''
      }
    },
    methods: {
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
              }
            }
          }
        xmlhttp.open("POST",url,false);
        xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.send(param);
      },

      //获取用户列表
      getUserMealData(user) {
        console.log(user)
        this.selectedUser = user
        let param = {'EmployeeId':user.EmployeeId, 'Type':user.Type}
        this.loadXMLDoc('http://' + this.ip + '/canteen/reportForOne.php',qs.stringify(param), 'userMealData')
      },
      checkUserMealData(checkUserName) {
        this.checkUserData = []
        if (checkUserName == '') {
          this.userData = this.allUserData
          this.getUserMealData(this.allUserData[0])
        } else {
          for (var user of this.allUserData) {
            if (user.EmployeeName.indexOf(checkUserName) >= 0) {
              this.checkUserData.push(user)
            }
          }
          this.userData = this.checkUserData
          if (this.userData.length !== 0) {
            this.hasSelectedUser = true
            this.getUserMealData(this.checkUserData[0])
          } else {
            this.hasSelectedUser = false
            this.userMealData = []
          }
        }
      },
      exportToExcel() {
        var html = "<html><head><meta charset='utf-8' /></head><body>" + document.getElementById("userMealTable").outerHTML + "</body></html>";
        // 实例化一个Blob对象，其构造函数的第一个参数是包含文件内容的数组，第二个参数是包含文件类型属性的对象
        var blob = new Blob([html], { type: "application/vnd.ms-excel" });
        var a = document.getElementsByTagName("a")[0];
        // 利用URL.createObjectURL()方法为a元素生成blob URL
        a.href = URL.createObjectURL(blob);
        // 设置文件名，目前只有Chrome和FireFox支持此属性
        a.download = this.selectedUser.EmployeeName + this.currYear + "就餐汇总.xls";
      }
    },
    created() {
      this.year = new Date().getFullYear()
      this.currYear = new Date().getFullYear()
      this.loadXMLDoc('http://' + this.ip + '/canteen/queryAllEmployee.php', '', 'allUserData')
      this.userData = this.allUserData
      this.getUserMealData(this.allUserData[0]);
    },
    watch:{
      checkUserName(curVal,oldVal) {
        if (curVal == '') {
          this.hasSelectedUser = true
          this.userData = this.allUserData
          this.getUserMealData(this.userData[0])
        }
      }
    }
  }

</script>

<style scoped>

</style>