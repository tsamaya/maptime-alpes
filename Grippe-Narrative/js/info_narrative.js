
function generateParagraphs(id,data){
    var narrative = d3.select(".viz-content").append("div").attr("class","scrolling-center");
    var scroll_div = d3.select(".scrolling-center")[0][0];
    var ch_margin = {top: 10, right: 30, bottom: 20, left: 165};
    var narrwidth = scroll_div.clientWidth-20;
    var chartwidth = narrwidth - ch_margin.left - ch_margin.right;
    var chartheight = data[0].counts.length*22 - ch_margin.top - ch_margin.bottom;
    
    var x = d3.scale.linear()
        .domain([0,2500])
        .range([0, chartwidth]);
    var barHeight = 12;

    var week = narrative.selectAll("div")
        .data(data)
        .enter()
        .append("div")
        .attr("class","narrative-content")
        .attr("id", function(d,i){
            return "narr_"+i;
        });

    var week_date = week.append("div")
        .text(function(d){
            return d.year+', semaine '+d.week;
        })
        .attr("id", function(d,i){
            return "date_"+i;
        })
        .attr("class","narative-date");

    var week_header = week.append("h3")
        .text(function(d){
            return d.headline;
        });

    var week_text = week.append("p")
        .text(function(d){
            return d.narrative;
        });

    var svg = week.append("svg")
        .attr("width", narrwidth-15)
        .attr("height", chartheight)
        .append("g")
        .attr("transform", "translate(" + ch_margin.left + "," + ch_margin.top + ")");

    var bar = svg.selectAll("g")
        .data(function(d){ 
            var s = d.counts.sort(function(a,b){
                return d3.descending(a.cases,b.cases);
            });
            return s;
        })
        .enter()
        .append("g")
        .attr("class",function(d){ return 'g_'+d.region })
        .classed("barrow",true)
        .attr("transform", function(d, i) { return "translate(0," + i * (barHeight+8) + ")"; })
        .on("mouseover",barHoverOn)
        .on("mouseout",barHoverOff);  

    bar.append("rect")
        .attr("width", function(d) { ;return x(d.cases); })
        .attr("height", barHeight)
        .classed("cases",true)
        .attr("fill",function(d){
            return numtohex(d.cases);
        });

    bar.append("text")
        .attr("x", function(d) { return x(d.cases)+3; })
        .attr("y", 0)
        .attr("dy", ".8em")
        .classed("barlabel",true)
        .text(function(d) { return d.cases; });

                
    bar.append("text")
    .attr("text-anchor","end")
        .attr("x", -5)
        .attr("y", 0)
        .attr("dy", ".8em")
        .classed("barregion",true)
        .text(function(d,i){ return d.region; });  

    // make each one at least full-height
    d3.selectAll(".narrative-content")
        .style("min-height",d3.select((document.documentElement).clientHeight-75-40)+"px");
}
    
function barHoverOn(d) {
    d3.selectAll(".barhover").classed("barhover", false);
    d3.select(this).classed("barhover", true);
    d3.selectAll(".maphover").classed("maphover", false);
    d3.selectAll("#"+d.region).classed("maphover", true);
}

function barHoverOff(d) {
  d3.selectAll(".maphover").classed("maphover", false);
  d3.selectAll(".barhover").classed("barhover", false);
}

function generateTimeline(id,data){

    tl_margin = {top: 5, right: 10, bottom: 30, left: 10};
    tl_width = 50;
    tl_height = $(window).height()-tl_margin.top-tl_margin.bottom-header_height;
    var svg = d3.select("#timeline")
            .append("svg")
            .attr("width", tl_width)
            .attr("height", tl_height+tl_margin.top+tl_margin.bottom)
            .append("g")
      
    var scale = d3.scale.linear()
            .range([tl_margin.top, tl_height])    
            .domain([1,data.length])
        
    svg.selectAll("g1")
        .data(data)
        .enter()
        .append("text")
        .attr("y", function(d,i) {
            return scale(i+1)+3+tl_margin.top;
        })
        .attr("x", 25)
        .attr("dx", ".35em")
        .attr("class","barlabel")
        .text(function(d,i) {
                return d['week'] < 10 ? 's0'+d.week : 's'+d.week;
        });              

    svg.append("line")
        .attr("y1", tl_margin.top+tl_margin.top)
        .attr("x1", 20)
        .attr("y2", tl_height+tl_margin.top)
        .attr("x2", 20)
        .attr("stroke-width", .5) 
        .attr("class","tl_line")         
    
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cy", function(d,i) {
             return scale(i+1)+tl_margin.top;
        })
        .attr("cx", function(d) {
             return 20;
        })
        .attr("r", 3.5)
        .attr("id",function(d,i){return "time_"+i;})
        .attr("class","tl_circle")
        .attr("pos",function(d,i){return i;});

    svg.selectAll("trigger_circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cy", function(d,i) {
             return scale(i+1)+tl_margin.top;
        })
        .attr("cx", function(d) {
             return 20;
        })
        .attr("r", 8)
        .attr("id",function(d,i){return "time_"+i;})
        .attr("class","tl_trigger_circle")
        .attr("pos",function(d,i){return i;})
        .on("click",function(e){
            updatenarrative(e.pos);
        });
        
    svg.append("circle")
        .attr("cy", tl_margin.top+tl_margin.top)
        .attr("cx", function(d) {
             return 20;
        })
        .attr("r", 8)
        .attr("id","selectedcircle")
        .attr("stroke-width", .5 )
        .attr("stroke", "rgb(50,160,160)") 
        .attr("fill-opacity","0.3")
        .attr("fill","rgb(50,160,160)");         
}

function generateMap(id){
    d3.json("data/france_regions.geojson", function(error, fr) {
        if (error) return console.error(error); 
        var margin = {top: 10, right: 0, bottom: 10, left: 10};
        var viz_cont = d3.select(".viz-content")[0][0];
        var center_cont = d3.select(".scrolling-center")[0][0];
        var avail_width = viz_cont.clientWidth - center_cont.offsetLeft - center_cont.clientWidth;
        var width = avail_width - margin.left - margin.right;
        var height = $(window).height()-margin.top-margin.bottom-header_height;
        
        d3.select("#map")
            .style("height",height-20+"px");

        var projection = fitProjection( 
            d3.geo.mercator(), 
            fr, 
            [[10,10],[width-10,height-10]],
            true
        ); 
            
        var svg = d3.select(id).append("svg")
            .attr("width", width)
            .attr("height", height);

        var path = d3.geo.path()
            .projection(projection);

        var g = svg.append("g");
        
        g.selectAll("path")
            .data(fr.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("id",function(d,i){return d.properties.ADM1_NAME;})
            .attr("class","region")
            .attr("fill","transparent")
            .on("mouseover",mapHoverOn)
            .on("mouseout",mapHoverOff); 

        highlightmap(0);

        d3.select('#map').attr('class','map-container');
    });
}

function mapHoverOn(d) {
    d3.selectAll(".maphover").classed("maphover", false);
    d3.select(this).classed("maphover", true);
    d3.selectAll(".barhover").classed("barhover", false);
    d3.selectAll(".g_"+d.properties.ADM1_NAME).classed("barhover", true);
}

function mapHoverOff(d) {
  d3.selectAll(".maphover").classed("maphover", false);
  d3.selectAll(".barhover").classed("barhover", false);
}

function highlighttimeline(id,num){    
    var scale = d3.scale.linear()
            .range([tl_margin.top, tl_height])    
            .domain([1,data.length]) 
       
    d3.select('#selectedcircle')
        .transition()
        .attr("cy", function(d,i) {
             return scale(num+1)+tl_margin.top;
        })
        
}

function highlightmap(num){
    var d = data[num].counts;
    d.forEach(function(element){
       d3.select("#"+element.region).transition().attr("fill",numtohex(element.cases,2100))
    });
}

function updateinfographic(temppara){
    if(currentpara!==temppara){
        highlighttimeline('#timeline',temppara);
        highlightmap(temppara);
        d3.selectAll('.narative-date').classed('current',false);
        d3.select('#date_'+temppara).classed('current',true);
        currentpara=temppara;
    }
}

function updatenarrative(temppara){
    if(currentpara!==temppara){
        doScroll("#narr_"+temppara);
    }
}
            
function getParagraphInView(numparas,mar){
    var parainview=0;

    for(i=0;i<numparas;i++){
        var ot = d3.select('#narr_'+i)[0][0].offsetTop;
        var st = $(window).scrollTop();
        if(ot-mar<=st && Math.abs(st-mar)>200){
            parainview=i;
        }
    }
    return parainview;
}

// functions for paragraph scroll
var doit
$(window).scroll(function (){
    if (doit){clearTimeout(doit)} else {var doit};
    doit = setTimeout(function(){
        updateinfographic(getParagraphInView(data.length,125));
    }, 100);
});    

// initialization
var currentpara = -1;
var tl_width, tl_height,tl_margin;
var header_height = 75;
          
generateParagraphs('#text',data);
generateTimeline('#timeline',data);
generateMap('#map');
updateinfographic(0);

