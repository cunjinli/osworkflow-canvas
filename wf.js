
(function() {

	/**
	 * 流程图绘制
	 * @param canvas
	 * @param xmlStr
	 * @param lytStr
	 * @param currentSteps
	 * @param historySteps
	 * @returns {WfCanvas}
	 */
	function WfCanvas(canvas, xmlStr, lytStr, currentSteps, historySteps) {
		currentSteps = currentSteps || [];
		historySteps = historySteps || [];
		var 
			cvs = $(canvas),
			//bcolor = $(canvas).css("background-color"),
			fontFamily = "Arial",
			fontSize = 15,
			
			font = "normal normal bold " + fontSize + "px " + fontFamily,
			labelFontSize = 12,
			labelFont = "normal normal normal " + labelFontSize + "px " + fontFamily,
			fontColor = "Black",
			borderColor = "Black",
			stepColor = "#FFFF37",
			lineColor = "Black",
			shadowOffset = 6;
			initActionCorlor = "#9AFF02",
			currentStepColor = "#FF5151",
			historyStepColor = "#9AFF02",
			shadwColor = "#d0d0d0",
			ctx = null,
			xml = null,
			lyt = null,
			xmlNodeMap = {},
			cellNodeMap = {},
			connectorNodeMap = {},
			cellMap = {},
			connectorMap = {};

		/**
		 * 画流程图
		 */
		function drawWf() {
			init();
			mouseSupport();
			draw();
		}

		function init() {
			
			if(!canvas.getContext) {
				window.G_vmlCanvasManager.initElement(canvas);  
			}
			ctx = canvas.getContext("2d");

			/*
			// 原有的计算位置的代码
			xml = $.parseXML(xmlStr);
			lyt = $.parseXML(lytStr);

			$.each($(xml).find("[id]"), function(i, node) {
				xmlNodeMap[$(node).attr("id")] = node;
			});

			$.each($(lyt).find("[id]"), function(i, node) {
				if (node.tagName == "cell") {
					cellNodeMap[$(node).attr("id")] = node;
				} else if (node.tagName == "connector") {
					connectorNodeMap[$(node).attr("id")] = node;
				}
			});

			$.each(cellNodeMap, function(id, cellNode){
				cellNode = $(cellNode);
				var xmlNode = $(xmlNodeMap[id]);
				var isCurrent = false;
				var isHistory = false;
				$.each(currentSteps, function(idx, stepId){
					if (stepId == id) {
						isCurrent = true;
					}
				});
				$.each(historySteps, function(idx, stepId){
					if (stepId == id) {
						isHistory = true;
					}
				});
				cellMap[id] = {
					id: id,
					name: xmlNode.attr("name"),
					type : cellNode.attr("type"),
					height: parseFloat(cellNode.attr("height")),
					width: parseFloat(cellNode.attr("width")),
					labelx: parseFloat(cellNode.attr("labelx")),
					labely: parseFloat(cellNode.attr("labely")),
					x: parseFloat(cellNode.attr("x")),
					y: parseFloat(cellNode.attr("y")),
					isCurrent: isCurrent,
					isHistory: isHistory
				};
			});

			$.each(connectorNodeMap, function(id, connectorNode){
				connectorNode = $(connectorNode);
				var xmlNode = $(xmlNodeMap[id]);
				var actionNode = xmlNode.parent().parent();
				var stepNode = actionNode.parent().parent();
				var srcId = stepNode.attr("id");
				if (actionNode.parent()[0].tagName == "initial-actions") {
					srcId = actionNode.attr("id");
				}
				var routings = [];
				var routingNodes = connectorNode.children("routing");
				$.each(routingNodes, function(idx, routingNode) {
					routingNode = $(routingNode);
					var routing = {
						x: parseFloat(routingNode.attr("x")),
						y: parseFloat(routingNode.attr("y"))
					};
					routings.push(routing);
				});
				connectorMap[id] = {
					id: id,
					label: actionNode.attr("name"),
					color : connectorNode.attr("color"),
					linewidth: parseFloat(connectorNode.attr("linewidth")),
					labelx: parseFloat(connectorNode.attr("labelx")),
					labely: parseFloat(connectorNode.attr("labely")),
					from: parseInt(connectorNode.attr("from")),
					to: parseInt(connectorNode.attr("to")),
					src: cellMap[srcId],
					target: cellMap[xmlNode.attr("step")],
					routings: routings
				};
			});
			*/
			dynamicLayout(xmlStr, lytStr);

			var size = calculateCanvasSize();
			//cvs.width(size.width);
			//cvs.height(size.height);
			canvas.width = size.width + 10;
			canvas.height = size.height + 10;
		}
		// @cunjinli
		function dynamicLayout(xmlStr, lytStr) {
			xml = $.parseXML(xmlStr);
			lyt = $.parseXML(lytStr);
			$.each($(xml).find("[id]"), function(i, node) {
				if (node.tagName == "unconditional-result") {
					connectorNodeMap[$(node).attr("id")] = node;
				}
				xmlNodeMap[$(node).attr("id")] = node;
			});
			// 所有的都是cellNode，connectorNodeMap动态生成
			$.each($(lyt).find("[id]"), function(i, node) {
				cellNodeMap[$(node).attr("id")] = node;
			});

			$.each(cellNodeMap, function(id, cellNode){
				cellNode = $(cellNode);
				var xmlNode = $(xmlNodeMap[id]);
				var parent = xmlNode.parent()[0];
				var isCurrent = false;
				var isHistory = false;
				$.each(currentSteps, function(idx, stepId){
					if (stepId == id) {
						isCurrent = true;
					}
				});

				// 动态计算historySteps，参考calculateHistoryStep
				// $.each(historySteps, function(idx, stepId){
				// 	if (stepId == id) {
				// 		isHistory = true;
				// 	}
				// });
				var rowHeight = 40, rowpadding = 30, rowWidth = 120, interval = 10,
					row = parseFloat(cellNode.attr('row')),
					col = parseFloat(cellNode.attr("col")),
					x = (col-1) * (rowWidth + rowpadding*2+interval) + rowpadding,
					y = (row-1) * (rowHeight + rowpadding*2+interval) + rowpadding;

				cellMap[id] = {
					id: id,
					name: xmlNode.attr("name"),
					type : cellNode.attr("type"),
					height: parseFloat(cellNode.attr("height")) || rowHeight,
					width: parseFloat(cellNode.attr("width")) || rowWidth,
					labelx: parseFloat(cellNode.attr("labelx")) || 500,
					labely: parseFloat(cellNode.attr("labely")) || 500,
					x: x || parseFloat(cellNode.attr("x")),
					y: y || parseFloat(cellNode.attr("y")),
					isCurrent: isCurrent,
					isHistory: isHistory,
					row: row,
					col: col,
					initial: parent.tagName == "initial-actions"
				};
			});

			$.each(connectorNodeMap, function(id, connectorNode){
				connectorNode = $(connectorNode);
				var xmlNode = $(xmlNodeMap[id]);
				var actionNode = xmlNode.parent().parent();
				var stepNode = actionNode.parent().parent();
				var srcId = stepNode.attr("id");

				if (actionNode.parent()[0].tagName == "initial-actions") {
					srcId = actionNode.attr("id");
				}
				var srcNode = cellMap[srcId];
				var targetNode = cellMap[xmlNode.attr("step")];
				var interval = 20, from = 0, to = 0, routings = [];

				// @cunjinli 手动计算from、to、routings
				// src在target的左侧列
				if (srcNode.col < targetNode.col) {
					from = 5;
					to = 4;

					// 无需绕路而行，routings: (src_x+20, src_y), (src_x+20, target_y)
					var flag = false;
					if (srcNode.col < targetNode.col-1) {
						// 判断是否穿过了某个cell
						$.each(cellMap, function(id, cell) {
							if (cell.row == targetNode.row && cell.col < targetNode.col && cell.col > srcNode.col) {
								flag = true;
								return;
							}
						});
					}
					// 没有穿过
					if(!flag) {
						if (srcNode.row != targetNode.row) {
							routings.push({x: srcNode.x + srcNode.width+interval, y: srcNode.y + srcNode.height/2});
							routings.push({x: srcNode.x + srcNode.width+interval, y: targetNode.y+targetNode.height/2});	
						}
						// 同一行上，直连，没有任何的routing
					} else {
						if (srcNode.row > targetNode.row) {
							routings.push({x: srcNode.x + srcNode.width+interval, y: srcNode.y + srcNode.height/2});
							routings.push({x: srcNode.x + srcNode.width+interval, y: targetNode.y+targetNode.height+interval});
							routings.push({x: targetNode.x - interval, y: targetNode.y+targetNode.height+interval});
							routings.push({x: targetNode.x - interval, y: targetNode.y+targetNode.height/2});
						} else if(srcNode.row == targetNode.row) {
							from = 7;
							routings.push({x: srcNode.x+srcNode.width/2, y: srcNode.y+srcNode.height+interval});
							routings.push({x: targetNode.x - interval, y: targetNode.y+targetNode.height+interval});
							routings.push({x: targetNode.x - interval, y: targetNode.y+targetNode.height/2});
						} else {
							from = 7;
							to = 2;
							routings.push({x: srcNode.x+srcNode.width/2, y: srcNode.y+srcNode.height+interval});
							routings.push({x: targetNode.x + targetNode.width/2, y: srcNode.y+srcNode.height+interval});
						}
					}
				} else if (srcNode.col == targetNode.col) {
					if (srcNode.row < targetNode.row) {
						var flag = false;
						if (srcNode.row < targetNode.row-1) {
							// 判断是否穿过了某个cell
							$.each(cellMap, function(id, cell) {
								if (cell.col == targetNode.col && cell.row < targetNode.row && cell.row > srcNode.row) {
									flag = true;
									return;
								}
							});
						}
						// 穿过了
						from = 7;
						to = 2;
						if (flag) {
							to = 4;
							routings.push({x: srcNode.x+srcNode.width/2, y: srcNode.y+srcNode.height+interval});
							routings.push({x: srcNode.x-interval, y: srcNode.y+srcNode.height+interval});
							routings.push({x: srcNode.x-interval, y: targetNode.y+targetNode.height/2});
						} else {
							// no routings，直连
						}
					} else if (srcNode.row > targetNode.row) {
						from = 7;
						to = 2;
						routings.push({x: srcNode.x+srcNode.width/2, y: srcNode.y+srcNode.height+interval});
						routings.push({x: srcNode.x-interval, y: srcNode.y+srcNode.height+interval});
						routings.push({x: srcNode.x-interval, y: targetNode.y-interval});
						routings.push({x: srcNode.x+srcNode.width/2, y: targetNode.y-interval});
					}
					
				} else { // srcNode.col > targetNode.col
					if (srcNode.row >= targetNode.row) {
						from = 5;
						to = 2;
						routings.push({x: srcNode.x+srcNode.width+interval, y: srcNode.y+srcNode.height/2});
						routings.push({x: srcNode.x+srcNode.width+interval, y: targetNode.y-interval});
						routings.push({x: targetNode.x+targetNode.width/2, y: targetNode.y-interval});
					} else {
						var flag = false;
						// 判断是否穿过了某个cell
						$.each(cellMap, function(id, cell) {
							if (cell.col == srcNode.col && cell.row < targetNode.row && cell.row > srcNode.row) {
								flag = true;
								return;
							}
						});
						
						if(!flag) {
							from = 7;
							to = 2;
							routings.push({x: srcNode.x+srcNode.width/2, y: targetNode.y-interval});
							routings.push({x: targetNode.x+targetNode.width/2, y: targetNode.y-interval});	
						} else {
							from = 5;
							to = 2;
							routings.push({x: srcNode.x+srcNode.width+interval, y: srcNode.y+srcNode.height/2});
							routings.push({x: srcNode.x+srcNode.width+interval, y: targetNode.y-interval});
							routings.push({x: targetNode.x+targetNode.width/2, y: targetNode.y-interval});
						}
						
					}
				}
				
				connectorMap[id] = {
					id: id,
					label: actionNode.attr("name"),
					// color : connectorNode.attr("color"),
					linewidth: parseFloat(connectorNode.attr("linewidth")) || 1,
					labelx: parseFloat(connectorNode.attr("labelx")) || 500,
					labely: parseFloat(connectorNode.attr("labely")) || 500,
					from: from,
					to: to,
					src: cellMap[srcId],
					target: cellMap[xmlNode.attr("step")],
					routings: routings
				};
			});
			
			// 动态计算历史的节点
			calculateHistoryStep(currentSteps);

		}

		function calculateHistoryStep(currentSteps) {
			var nowSteps = [];
			if (!currentSteps.length)
				return;

			$.each(currentSteps, function(idx, stepId) {
				var currentCell = cellMap[stepId];
				$.each(connectorMap, function(id, connector) {
					if (currentCell.id == connector.target.id) {
						connector.target.isHistory = true;
						nowSteps.push(connector.src.id);
					}
				});
			});
			nowSteps.length > 0 && calculateHistoryStep(nowSteps);
		}

		function calculateCanvasSize() {
			var minx = 0, miny = 0, maxx = 0, maxy=0;
			$.each(cellMap, function(id, cell) {
				minx = Math.min(minx, cell.x);
				miny = Math.min(miny, cell.y);
				maxx = Math.max(maxx, cell.x + cell.width);
				maxy = Math.max(maxy, cell.y + cell.height);
			});
			$.each(connectorMap, function(id, connector) {
				$.each(connector.routings, function(i, r) {
					minx = Math.min(minx, r.x);
					miny = Math.min(miny, r.y);
					maxx = Math.max(maxx, r.x);
					maxy = Math.max(maxy, r.y);
				});
			});
			return {
				width: maxx - minx,
				height: maxy - miny
			};
		}

		function mouseSupport() {
			cvs.unbind("mousemove").mousemove(function(e) {
				$.each(cellMap, function(id, cell){
					if (!cell.isHover) {
						if (isInRange(e, cell)) {
							cell.isHover = true;
							cvs.css("cursor", "pointer");
						} else {
							cell.isHover = false;
						}
					} else {
						if (!isInRange(e, cell)) {
							cell.isHover = false;
							cvs.css("cursor", "default");
						} else {
							cell.isHover = true;
						}
					}
				});
			});
			cvs.unbind("click").click(function(e) {
				$.each(cellMap, function(id, cell){
					if (isInRange(e, cell)) {
						alert(cell.name);
					}
				});
			});
		}
		
		function isInRange(e, cell) {
			var x = e.offsetX || e.clientX - cvs.offset().left,
				y = e.offsetY || e.clientY - cvs.offset().top;
			
			if (x >= cell.x && x <= cell.x + cell.width 
					&& y >= cell.y && y <= cell.y + cell.height) {
				return true;
			}
			
			return false;
		}
		
		/**
		 * 画流程图
		 */
		function draw() {
			ctx.clearRect(0, 0, cvs.width(), cvs.height());
			$.each(cellMap, function(id, cell) {
				drawCell(cell);
			});
			$.each(connectorMap, function(id, connector) {
				drawConnector(connector);
			});
		}

		/**
		 * 画步骤
		 * @param cell
		 */
		function drawCell(cell) {
			ctx.strokeStyle = borderColor;
			if (cell.type == "InitialActionCell") {
				ctx.fillStyle = initActionCorlor;
				drawEllipse(cell, cell.width, cell.height);
			} else {
				if (cell.isCurrent) {
					ctx.fillStyle = currentStepColor;
				} else if (cell.isHistory){
					ctx.fillStyle = historyStepColor;
				} else {
					ctx.fillStyle = stepColor;
				}
				drawRect(cell, cell.width, cell.height);
			}
			
			// var fx = cell.x + (cell.width - cell.name.length * fontSize) / 2;
			var fy = cell.y + (cell.height - fontSize) / 2 + fontSize;
			var fx = cell.x + cell.width/2;

			ctx.textAlign="center";
			ctx.font = font;
			ctx.fillStyle = fontColor;
			ctx.fillText(cell.name, fx, fy);
		}

		/**
		 * 画连接
		 * @param c
		 */
		function drawConnector(c) {
			var points = [];
			// 起点
			points.push(getPortPoint(c.src, c.from));
			// 中间点
			$.each(c.routings, function(idx, routing) {
				points.push(routing);
			});
			// 终点
			points.push(getPortPoint(c.target, c.to));
			
			var last = points.length - 1;
			// 如果两端是cell的中点，就获取与cell相交的点
			if (c.from == 0) {
				points[0] = getCrossPoint(c.src, points[1], points[0]);
			};
			if (c.to == 0) {
				points[last] = getCrossPoint(c.target, points[last-1], points[last]);
			};

			// 画线
			ctx.strokeStyle = lineColor;
			for (var i = 0; i < last; i++) {
				drawLine(points[i], points[i+1]);
			}
			
			// 画文字
			var dx = points[last].x - points[0].x,
				dy = points[last].y - points[0].y,
				fx = c.labelx / 1000 * dx + points[0].x,
				fy = c.labely / 1000 * dy + points[0].y,
				fw = c.label.length * labelFontSize,
				fh = labelFontSize;
			
			fx -= fw / 2;
			fy += fh / 2;
			
			//ctx.fillStyle = bcolor;
			//ctx.fillRect(fx, fy, fw, fh);
			//ctx.strokeRect(fx, fy, fw, fh);
			
			//@cunjinli
			//label显示在最长的points上
			var max_index=-1, max_len = 0, tmp_len;
			for(var i = 1; i < points.length; i++) {
				tmp_len = Math.sqrt(Math.pow(Math.abs(points[i].x-points[i-1].x), 2) + Math.pow(Math.abs(points[i].y-points[i-1].y), 2));
				if (tmp_len > max_len) {
					max_len = tmp_len;
					max_index = i;
				}
			}
			if (max_index > 0) {
				fx = Math.abs(points[max_index].x - points[max_index-1].x)/2 + points[max_index-1].x;
				fy = Math.abs(points[max_index].y - points[max_index-1].y)/2 + points[max_index-1].y;
			}

			ctx.textAlign="center";
			ctx.font = labelFont;
			ctx.fillStyle = fontColor;
			ctx.fillText(c.label, fx, fy);
			
			// 画箭头
			drawArrow(points[last-1], points[last]);

		};

		/**
		 * 画圆角方块
		 * @param p 坐标点
		 * @param w 宽度
		 * @param h 高度
		 * @param fill 是否填充
		 * @param stroke 是否画线
		 * @param drawShadow 是否画阴影
		 */
		function drawRect(p, w, h, fill, stroke, drawShadow) {
			fill = typeof(fill) == "undefined" ? true : fill;
			stroke = typeof(stroke) == "undefined" ? true : stroke;
			drawShadow = typeof(drawShadow) == "undefined" ? true : drawShadow;
			if (drawShadow) {
				var offset = shadowOffset;
				var oldStyle = ctx.fillStyle;
				ctx.fillStyle = shadwColor;
				drawRect({x: p.x + offset, y: p.y + offset}, w, h, true, false, false);
				ctx.fillStyle = oldStyle;
			}

			var x = p.x,
				y = p.y,
				r = 5; // 圆角半径
			if (w < 2 * r) {
				r = w / 2;
			}
			if (h < 2 * r) {
				r = h / 2;
			}
			ctx.beginPath();
			ctx.moveTo(x + r, y);
			ctx.lineTo(x + w - r, y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + r);
			ctx.lineTo(x + w, y + h - r);
			ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
			ctx.lineTo(x + r, y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - r);
			ctx.lineTo(x, y + r);
			ctx.quadraticCurveTo(x, y, x + r, y);
			ctx.closePath();
			if (stroke) {
				ctx.stroke();
			}
			if (fill) {
				ctx.fill();
			} 
		}

		/**
		 * 画椭圆
		 * @param p 坐标点
		 * @param w 宽度
		 * @param h 高度
		 * @param fill 是否填充
		 * @param stroke 是否画线
		 * @param drawShadow 是否画阴影
		 */
		function drawEllipse(p, w, h, fill, stroke, drawShadow) {
			fill = typeof(fill) == "undefined" ? true : fill;
			stroke = typeof(stroke) == "undefined" ? true : stroke;
			drawShadow = typeof(drawShadow) == "undefined" ? true : drawShadow;
			if (drawShadow) {
				var offset = shadowOffset;
				var oldStyle = ctx.fillStyle;
				ctx.fillStyle = shadwColor;
				drawEllipse({x: p.x + offset, y: p.y + offset}, w, h, true, false, false);
				ctx.fillStyle = oldStyle;
			}
			var k = 0.5522848,
				a = w / 2,
				b = h / 2,
				ox = a * k, // 水平控制点偏移量
				oy = b * k, // 垂直控制点偏移量
				x = p.x + a, y = p.y + b;
			ctx.beginPath();
			// 从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
			ctx.moveTo(x - a, y);
			ctx.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b);
			ctx.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y);
			ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
			ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
			ctx.closePath();
			if (fill) {
				ctx.fill();
			}
			if (stroke) {
				ctx.stroke();
			}
		}

		function getCrossPoint(cell, p1, p2) {
			var x = p2.x, 
				y = p2.y,
				dx = p2.x - p1.x,
				dy = p2.y - p1.y;
			if (dx == 0 && dy == 0) {
				return p2;
			}
			if (Math.abs(dy) > 0 && Math.abs(dx) / Math.abs(dy) < cell.width / cell.height) {
				var tan = dx / dy;
				if (p2.y < p1.y) {
					x += cell.height / 2 * tan;
					y += cell.height / 2;
				} else {
					x -= cell.height / 2 * tan;
					y -= cell.height / 2;
				}
			} else {
				var tan = Math.abs(dx) > 0 ? dy / dx : 1;
				if (p2.x < p1.x) {
					x += cell.width / 2;
					y += cell.width / 2 * tan;
				} else {
					x -= cell.width / 2;
					y -= cell.width / 2 * tan;
				}
			}
			return {x: x, y: y};
		}

		function getPortPoint(cell, no) {
			var x = cell.x,
				y = cell.y;
			switch(no) {
			case 1: 
				x = cell.x;
				y = cell.y;
				break;
			case 2:
				x += cell.width / 2;
				break;
			case 3:
				x += cell.width;
				break;
			case 4:
				y += cell.height / 2;
				break;
			case 5:
				x += cell.width;
				y += cell.height / 2;
				break;
			case 6:
				y += cell.height;
				break;
			case 7:
				x += cell.width / 2;
				y += cell.height;
				break;
			case 8:
				x += cell.width;
				y += cell.height;
				break;
			case 0:
				x += cell.width / 2;
				y += cell.height / 2;
				break;
			}
			return {x:x, y:y};
		}

		/**
		 * 画线
		 * @param p1
		 * @param p2
		 */
		function drawLine(p1, p2) {
			ctx.beginPath();
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
			ctx.stroke();
		}

		/**
		 * 画箭头
		 * @param p1
		 * @param p2
		 */
		function drawArrow(p1, p2) {
			var 
				awrad = Math.PI / 6, // 箭头角度（30度）
				arrowLen = 10,      // 箭头长度
				ap0 = toRelative(p1, p2), // 旋转源点（line.p1相对于line.p2的坐标）
				ap1 = rotateVec(ap0, awrad, arrowLen), // 第一端点（相对于line.p2的坐标）
				ap2 = rotateVec(ap0, -awrad, arrowLen); // 第二端点（相对于line.p2的坐标）

			ap1 = toAbsolute(ap1, p2);
			ap2 = toAbsolute(ap2, p2);

			drawLine(p2, ap1);
			drawLine(p2, ap2);
		}

		// 转换成相对坐标
		function toRelative(p, p0) {
			return {
				x: p.x - p0.x,
				y: p.y - p0.y
			};
		}

		// 转换回绝对坐标
		function toAbsolute(p, p0) {
			return {
				x: p.x + p0.x,
				y: p.y + p0.y
			};
		}

		/**
		 * 矢量旋转函数
		 * @param p 坐标源点
		 * @param ang 旋转角
		 * @param newLen 新长度
		 * @returns {x,y}
		 */
		function rotateVec(p, ang, newLen) {
			var vx = p.x * Math.cos(ang) - p.y * Math.sin(ang);
			var vy = p.x * Math.sin(ang) + p.y * Math.cos(ang);
			var d = Math.sqrt(vx * vx + vy * vy);
			if (Math.abs(d) > 0) {
				vx = vx / d * newLen;
				vy = vy / d * newLen;
			}
			return {
				x : vx,
				y : vy
			};
		}

		/**
		 * 计算一点相对于圆心旋转后的坐标
		 * @param c 圆心
		 * @param p 点
		 * @param r 旋转弧度
		 */
		function rotate(c, p, r) {
			return {
				x: (p.x - c.x) * Math.cos(r) - (p.y - c.y) * Math.sin(r) + c.x,
				y: (p.y - c.y) * Math.cos(r) + (p.x - c.x) * sin(r) + c.y
			};
		}
		
		$.extend(this, {
			drawWf: drawWf
		});
	}
	
	window.drawWf = function(canvas, xmlStr, lytStr, currentSteps, historySteps) {
		var wf = new WfCanvas(canvas, xmlStr, lytStr, currentSteps, historySteps);

		wf.drawWf();
	};
})();



