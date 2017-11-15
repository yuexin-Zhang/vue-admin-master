<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true">
                <el-form-item>
                    <el-input v-model="checkTitle" placeholder="文章标题"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="checkArticleTitle">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增文章</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table ref="multipleTable" :data="articleData" highlight-current-row v-loading="listLoading" style="width: 100%;">
            <el-table-column prop="index" label="编号" width="80">
            </el-table-column>
            <el-table-column prop="Title" label="标题" width="180">
            </el-table-column>
            <el-table-column prop="Content" label="内容">
            </el-table-column>
            <el-table-column label="图片">
                <template slot-scope="scope">
                    <img :src="scope.row.ImageLocation" width="100" height="100">
                </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                    <el-button type="danger" size="small" @click="handleDel(scope.row.ResourceId)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="allMenuData.length" :current-page="currentPage" style="float:right;">
            </el-pagination>
        </el-col>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="文章标题" prop="name">
                    <el-input v-model="title" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="文章内容" prop="name" placeholder="请输入文章标题">
                    <el-input type="textarea" :rows="2" placeholder="请输入文章标题" v-model="content" auto-complete="off"></el-input>
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
                <el-button type="success" @click.native="submitArticle" :loading="addLoading">提交</el-button>
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
                title: '',
                content: '',
                articleData: [],
                originData: [],
                checkTitle: '',

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

            //获取某页菜品列表
            getMenus(page) {
                let vm = this
                if (this.allMenuData.length > 5) {
                    this.menuData = this.allMenuData.slice(5*(page-1),5*(page-1)+5)
                } else {
                    this.menuData = this.allMenuData
                }
            },
            checkArticleTitle() {
                this.checkArticleData = []
                this.articleData = []
                let key = this.checkTitle
                console.log(key)
                if (key== '') {
                    this.getArticleData()
                } else {
                    for (var article of this.originData) {
                        if (article.Title.indexOf(key) > -1) {
                            this.checkArticleData.push(article)
                        }
                    }
                    this.articleData = this.checkArticleData
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
            handleDel: function (index,row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let param = qs.stringify({'ResourceId': index})
                    this.loadXMLDoc('http://116.62.66.130/canteen/deleteOneResource.php', param, '')
                    this.getArticleData()
                    this.checkArticleTitle = ''
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
            submitArticle() {
                let file = document.getElementsByClassName('el-upload__input')[0].files[0]
                if (this.title !== '' && this.content !== '') {
                    this.addLoading = true;
                    // let param = new FormData(); //创建form对象
                    // param.append('MenuName',this.newMenuName);//添加form表单中其他数据
                    // param.append('file',file);//通过append向form对象添加数据
                    // this.form.file = param.get('file')
                    // this.form.MenuName = param.get('MenuName')
                    // this.checkMenuName = ''
                    // console.log(param.get('file')); //FormData私有类对象，访问不到，可以通过get判断值是否传进去
                    // this.$refs.upload.submit();

                    let param = {
                        "Title": this.title,
                        "Content": this.content,
                        "Type": 2,
                        "EmployeeId": 1
                    }
                    this.listLoading = false
                    this.loadXMLDoc('http://116.62.66.130/canteen/addResource.php', qs.stringify(param), '')
                    if (!this.listLoading) {
                        this.$message({
                            message: '添加文章成功',
                            type: 'success'
                        });
                        this.title = ''
                        this.content = ''
                        this.dialogFormVisible = false
                        this.getArticleData()
                    } else {
                        //
                    }
                } else {
                    if (this.title == '') {
                        this.$message({
                            message: '文章标题不能为空',
                            type: 'warning'
                        });
                    } else if (this.content == '') {
                        this.$message({
                            message: '文章内容不能为空',
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
            getArticleData () {
                this.articleData = []
                this.loadXMLDoc('http://116.62.66.130/canteen/showAllResource.php', qs.stringify({}), 'originData')
                for (let [index,val] of this.originData.entries()){
                    val.index = index + 1
                    this.articleData.push(val)
                }
                console.log(this.articleData)
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
            this.getArticleData()
        },
        watch:{
            checkTitle(curVal,oldVal) {
                if (curVal == '') {
                    this.checkArticleTitle()
                } else {
                    this.checkArticleTitle()
                }
            }
        }
    }
</script>

<style scoped>

</style>