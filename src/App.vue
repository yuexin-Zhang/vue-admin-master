<template>
	<div id="app">
		<transition name="fade"
		            mode="out-in">
			<router-view></router-view>
		</transition>
	</div>
</template>

<script>
export default {
	name: 'app',
	components: {
	}
}

</script>

<style lang="scss">
body {
	margin: 0px;
	padding: 0px;
	/*background: url(assets/bg1.jpg) center !important;
		background-size: cover;*/
	// background: #1F2D3D;
	font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
	font-size: 14px;
	-webkit-font-smoothing: antialiased;
	ul {
		list-style: none;
	}
}

#app {
	position: absolute;
	top: 0px;
	bottom: 0px;
	width: 100%;
}

.el-submenu [class^=fa] {
	vertical-align: baseline;
	margin-right: 10px;
}

.el-menu-item [class^=fa] {
	vertical-align: baseline;
	margin-right: 10px;
}

.toolbar {
	background: #f2f2f2;
	padding: 10px;
	//border:1px solid #dfe6ec;
	margin: 10px 0px;
	.el-form-item {
		margin-bottom: 10px;
	}
}

.fade-enter-active,
.fade-leave-active {
	transition: all .2s ease;
}

.fade-enter,
.fade-leave-active {
	opacity: 0;
}
.user-list {
	margin-bottom: 20px;
	margin-left: 10px;
	.el-button {
		margin-left: 0px !important;
		margin-right: 10px;
		margin-bottom: 10px;
	}
}
.el-dialog--small {
	width: 40% !important;
}

.el-date-editor {
	margin: 20px 0;
}

.el-tag {
	font-size: 16px !important;
	/*margin-bottom: 10px;*/
	margin-left: 10px;
}

.el-table {
	margin-left: 10px;
	li {
		position: relative;
		.icon-delete {
			display: inline-block;
			margin-left: 5px;
			margin-top: 4px;
			position: absolute;
			background: url(../src/assets/icon-delete.png) no-repeat 0 0 ;
			width: 16px;
			height: 16px;
			cursor: pointer;
		}
	}
}

.export-btn {
	display: inline-block;
	background-color: #50bfff;
	color: #fff;
	padding: 10px 20px;
	float:right;
	margin-bottom: 10px;
	border-radius: 10px;
	cursor: pointer;
	text-decoration: none;
}
.importWeekDialog {
	width: 1000px;
	.el-date-editor {
		margin: 0px;
	}
}
</style>