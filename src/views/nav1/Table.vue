<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true">
				<el-form-item>
					<el-input v-model="checkMenuName" placeholder="菜名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="checkMenu">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table ref="multipleTable" :data="menuData" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column prop="index" label="编号" width="80">
			</el-table-column>
			<el-table-column label="图片">
				<template slot-scope="scope">
					<img :src="scope.row.ImageLocation" width="100" height="100">
		        </template>
			</el-table-column>
			<el-table-column prop="MenuName" label="菜名">
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template slot-scope="scope">
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="primary" @click="dialogFormVisible = true" :disabled="this.sels.length===0 && this.selectedMenus.length===0">添加至菜单</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="allMenuData.length" :current-page="currentPage" style="float:right;">
			</el-pagination>
		</el-col>

		<el-dialog title="请选择时间" :visible.sync="dialogFormVisible">
		  <el-form>
		     <el-form-item label="日期">
	           <el-date-picker
	            v-model="date"
	            type="date"
	            placeholder="选择日期"
	            :picker-options="pickerOptions0">
	          </el-date-picker>
	        </el-form-item>
		    <el-form-item label="时间">
            <el-select v-model="time" placeholder="请选择">
              <el-option
                v-for="item in options"
                :key="item.value"
                :value="item.value">
              </el-option>
            </el-select>
        </el-form-item>
		  </el-form>
		  <div slot="footer" class="dialog-footer">
		    <el-button @click="dialogFormVisible = false">取 消</el-button>
		    <el-button type="primary" @click="addMenu">确 定</el-button>
		  </div>
		</el-dialog>
		<!--新增界面-->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="新增菜名" prop="name">
					<el-input v-model="newMenuName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="上传图片">
					<el-upload
					  class="upload-demo"
					  ref="upload"
					  action="http://116.62.66.130:80/canteen/addNewDish.php"
					  :on-preview="handlePreview"
					  :on-remove="handleRemove"
					  :auto-upload="false"
					  :file-list="fileList"
					  :data="form"
					  :on-success="uploadSuccess">
					  <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
					  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
					</el-upload>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="success" @click.native="submitUpload" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
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
				filters: {
					MenuName: ''
				},
				allMenuData: [],
				menuData: [],
				checkMenuData: [],
				newMenuName: '',
				checkMenuName: '',
				total: 0,
				lastPage: 1,
				currentPage: 1,
				listLoading: false,
				sels: [],//列表选中列
				allSels: {},
				selectedMenus: [],
				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					MenuName: [
						{ required: true, message: '请输入菜名', trigger: 'blur' }
					]
				},
				//新增界面数据
				addForm: {
					MenuName: '',
				},
				fileList: [],
				dialogFormVisible: false,
				// formLabelWidth: '120px',
				date: '',
		        time: '',
		        options: [{
		          value: '中餐'
		        }, {
		          value: '晚餐'
		        }],
		        pickerOptions0: {
		          disabledDate(time) {
		            return time.getTime() < Date.now() - 8.64e7;
		          }
		        },
		        pageSize: 5,
		        form:{}
			}
		},
		methods: {
			handleCurrentChange(page) {
				this.currentPage = page
				this.getMenus(page)
				this.allSels[this.lastPage] = this.sels
				if (!!this.allSels) {
					for (var i in this.allSels) {
						for (var j in this.allSels[i]) {
							this.selectedMenus.push(this.allSels[i][j])
						}
					}
				}
				if (!!this.allSels[page] && this.allSels[page].length !== 0) {
					for (var sel of this.allSels[page]) {
						this.menuData.forEach((row,index) => {
							if (row.MenuId == sel.MenuId) {
								this.$nextTick(function(){
                    				this.$refs.multipleTable.toggleRowSelection(this.menuData[index]);
                				})
							}
						})
					}
				}
				this.lastPage = page
			},
			//获取全部菜品
			getAllMenuData () {
				this.loadXMLDoc('http://116.62.66.130:80/canteen/getAllDish.php', 'getAllDish=1','allMenuData')
				this.allMenuData.forEach((item, index) => {
					item.index = index + 1
				})
			},
			//获取某页菜品列表
			getMenus(page) {
				let vm = this
				if (this.allMenuData.length > 5) {
					this.menuData = this.allMenuData.slice(5*(page-1),5*(page-1)+5)
				} else {
					this.menuData = this.allMenuData
				}
			},
			checkMenu() {
				this.checkMenuData = []
				let key = this.checkMenuName
				if (key== '') {
					this.getMenus(1)
				} else {
					for (var menu of this.allMenuData) {
						if (menu.MenuName.indexOf(key) > -1) {
							this.checkMenuData.push(menu)
						}
					}
					this.menuData = this.checkMenuData
				} 
			},
			handleRemove(file, fileList) {
            },
            handlePreview(file) {
            },
            uploadSuccess(res, file, fileList) {
            	this.addLoading = false;
            	this.$message({
					message: '添加成功',
					type: 'success'
				});
				this.newMenuName = ''
				this.fileList = []
				this.addFormVisible = false;
				this.getAllMenuData()
				this.handleCurrentChange(Math.ceil(this.allMenuData.length / this.pageSize))
            },
			//删除
			handleDel: function (index, row) {
				let vm = this
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					let param = qs.stringify({'MenuId': row.MenuId})
					this.loadXMLDoc('http://116.62.66.130/canteen/deleteDish.php', param, '')
					this.getAllMenuData()
					this.getMenus(this.currentPage)
					this.checkMenuName = ''
					this.$message({
						message: '删除成功',
						type: 'success'
					});
				}).catch(() => {

				});
			},

			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.newMenuName = this.checkMenuName
			},
			submitUpload() {
				let file = document.getElementsByClassName('el-upload__input')[0].files[0]
				if (this.newMenuName !== '' && !!file) {
					this.addLoading = true;
			        let param = new FormData(); //创建form对象
	                param.append('MenuName',this.newMenuName);//添加form表单中其他数据
	                param.append('file',file);//通过append向form对象添加数据
	                // this.form.file = param.get('file')
	                this.form.MenuName = param.get('MenuName')
	                this.checkMenuName = ''
	                // console.log(param.get('file')); //FormData私有类对象，访问不到，可以通过get判断值是否传进去
	                this.$refs.upload.submit();
			    } else {
			    	if (this.newMenuName == '') {
			    		this.$message({
							message: '菜名不能为空',
							type: 'warning'
						});
			    	} else if (file == undefined) {
			    		this.$message({
							message: '请上传图片',
							type: 'warning'
						});
			    	}
			    }
		     },
			selsChange: function (sels) {
				this.sels = sels;
			},
			addMenu() {
				let vm = this
				this.selectedMenus = []
				this.allSels[this.currentPage] = this.sels
				let obj = this.allSels
				Object.keys(obj).forEach(function(key){
					for (var menu of obj[key]) {
						vm.selectedMenus.push(menu)
					}
				})
				let menuIds = ''
				for (var menu of this.selectedMenus) {
					menuIds += menu.MenuId + ','
				}
				if (this.date !== '' && this.time!== '') {
					let time = ''
					switch(this.time){
						case '早餐':
							time = 1
							break
						case '中餐':
							time = 2
							break
						case '晚餐':
							time = 3
							break
					}
					let date = util.formatDate.format(new Date(this.date), "yyyy-MM-dd")
					let param = {
						"EatingDate": date,
						"MenuId": menuIds.substring(0,menuIds.length-1),
						"EatingTime": time
					}
					this.listLoading = false
					this.loadXMLDoc('http://116.62.66.130/canteen/setEverydayMenu.php', qs.stringify(param), '')
					if (!this.listLoading) {
						this.$message({
							message: '添加菜单成功',
							type: 'success'
						});
						this.date = ''
						this.time = ''
						this.$refs.multipleTable.clearSelection();
						this.dialogFormVisible = false
						this.selectedMenus = []
					} else {
						if (this.date == '') {
							this.$message({
								message: '请选择日期',
								type: 'warning'
							});
						} else {
							this.$message({
								message: '请选择时间',
								type: 'warning'
							});
						}
					}
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
			this.lastPage = 1
			this.getAllMenuData()
			this.getMenus(1)
		},
		watch:{
	      	checkMenuName(curVal,oldVal) {
		        if (curVal == '') {
		          	this.getMenus(1)
		      	}
	    	}
	    }
	}
</script>

<style scoped>

</style>