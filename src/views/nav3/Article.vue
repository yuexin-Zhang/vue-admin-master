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
            <el-table-column prop="Content" label="内容" width="200">
            </el-table-column>
            <el-table-column label="图片">
                <template slot-scope="scope">
                    <img v-if="scope.row.Image !== ''" v-for="img in getImgArr(scope.row.Image)" :src="img" width="100" height="100" style="border: 1px solid #ddd;margin-right: 10px;margin-top: 10px;">
<!--                     <img  :src="getOneImg(scope.row.Image,0)" width="100" height="100">
                    <img v-if="split(scope.row.Image).length > 1" :src="getOneImg(scope.row.Image,1)" width="100" height="100">
                    <img v-if="scope.row.Image !== ''" :src="getOneImg(scope.row.Image,2)" width="100" height="100"> -->
                    <p v-else>无图片</p>
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
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="originData.length" :current-page="currentPage" style="float:right;">
            </el-pagination>
        </el-col>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="文章标题" prop="name">
                    <el-input v-model="title" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="文章内容" prop="name" placeholder="请输入文章标题">
                    <el-input type="textarea" :rows="4" placeholder="请输入文章标题" v-model="content" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="上传图片">
                    <el-upload
                      class="upload-demo"
                      ref="upload"
                      :action="'http://' + this.ip + '/canteen/addResource.php'"
                      multiple
                      :on-preview="handlePreview"
                      :on-remove="handleRemove"
                      :auto-upload="false"
                      :file-list="fileList"
                      :data="articleParams"
                      :on-success="uploadSuccess">
                      <el-button slot="trigger" size="small" type="primary" @click="addImg">选取文件</el-button>
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
                ip:util.ip,
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
                pageSize: 10,
                articleParams: {},
                needAddImg: false
            }
        },
        methods: {
            handleCurrentChange(page) {
                this.currentPage = page
                this.getArticles(page)
            },

            //获取某页菜品列表
            getArticles(page) {
                this.getArticleData()
                if (this.originData.length > 10) {
                    this.articleData = this.originData.slice(10*(page-1),10*(page-1)+10)
                } else {
                    this.articleData = this.originData
                }
            },
            checkArticleTitle() {
                this.checkArticleData = []
                this.articleData = []
                let key = this.checkTitle
                console.log(key)
                if (key== '') {
                    this.getArticles(1)
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
                this.fileList = fileList
                this.needAddImg = false
            },
            handlePreview(file) {
            },
            uploadSuccess(res, file, fileList) {
                this.addLoading = false;
                this.$message({
                    message: '添加成功',
                    type: 'success'
                });
                this.title = ''
                this.content = ''
                this.addFormVisible = false
                this.needAddImg = false
                this.currentPage = Math.ceil(this.originData.length/this.pageSize)
                this.getArticles(this.currentPage)
                this.articleParams = {}
            },
            getImgArr (urlString) {
                return urlString.split(',')
            },
            //删除
            handleDel: function (index,row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let param = qs.stringify({'ResourceId': index})
                    this.loadXMLDoc('http://' + this.ip + '/canteen/deleteOneResource.php', param, '')
                    // this.getArticleData()
                    this.getArticles(this.currentPage)
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
                this.fileList = []
            },
            addImg () {
                let file = document.getElementsByClassName('el-upload__input')[0].files[0]
                if (!!file) {
                    this.fileList.push(file)
                    this.needAddImg = true
                }
            },
            submitArticle() {
                let file = document.getElementsByClassName('el-upload__input')[0].files[0]
                if (this.needAddImg || !!file) {
                    console.log('111')
                    this.fileList.push(file)
                }
                if (this.title !== '' && this.content !== '') {
                    this.addLoading = true;
                    let param = new FormData(); //创建form对象
                    param.append('Title',this.title);//添加form表单中其他数据
                    param.append('Content',this.content);//添加form表单中其他数据
                    param.append('Type',2);//添加form表单中其他数据
                    param.append('EmployeeId',1);//添加form表单中其他数据
                    this.checkTitle = ''
                    if (this.fileList.length > 0) {
                        console.log(this.fileList.length)
                        switch (this.fileList.length) {
                            case 0:
                                break;
                            case 1:
                                param.append('upload[0]',this.fileList[0]);
                                this.articleParams['upload[0]'] = param.get('upload[0]')
                                break;
                            case 2:
                                param.append('upload[0]',this.fileList[0]);
                                this.articleParams['upload[0]'] = param.get('upload[0]')
                                param.append('upload[1]',this.fileList[1]);
                                this.articleParams['upload[1]'] = param.get('upload[1]')
                                break;
                            case 3:
                                param.append('upload[0]',this.fileList[0]);
                                this.articleParams['upload[0]'] = param.get('upload[0]')
                                param.append('upload[1]',this.fileList[1]);
                                this.articleParams['upload[1]'] = param.get('upload[1]')
                                param.append('upload[2]',this.fileList[2]);
                                this.articleParams['upload[2]'] = param.get('upload[2]')
                                break;
                        }
                        this.articleParams.Title = param.get('Title')
                        this.articleParams.Content = param.get('Content')
                        this.articleParams.Type = param.get('Type')
                        this.articleParams.EmployeeId = param.get('EmployeeId')
                        this.$refs.upload.submit();
                    } else {
                        this.articleParams.Title = param.get('Title')
                        this.articleParams.Content = param.get('Content')
                        this.articleParams.Type = param.get('Type')
                        this.articleParams.EmployeeId = param.get('EmployeeId')
                        this.loadXMLDoc('http://' + this.ip + '/canteen/addResource.php', qs.stringify(this.articleParams), '')
                        this.addLoading = false;
                        this.$message({
                            message: '添加成功',
                            type: 'success'
                        });
                        this.title = ''
                        this.content = ''
                        this.addFormVisible = false
                        this.needAddImg = false
                        this.currentPage = Math.ceil(this.originData.length/this.pageSize)
                        this.getArticles(this.currentPage)
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
                    }
                }
             },
            getArticleData () {
                this.articleData = []
                this.loadXMLDoc('http://' + this.ip + '/canteen/showAllResource.php', qs.stringify({}), 'originData')
                for (let [index,val] of this.originData.entries()){
                    val.index = index + 1
                    this.articleData.push(val)
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
            // this.getArticleData()
            this.getArticles(1)
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