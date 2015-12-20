(function ($) {
    $.widget('bisoyi.calendar', {

        options: {
            //selected date
            selectedDate: new Date(),

            //today
            today: new Date(),

            //at any time calendar shows 42 days(6 weeks, 7 days a week)
            //the selected month might flow to 6th week
            //happens when a 30 day month starts on saturday or 31 day month starts on friday/saturday
            //dates stores 42 dates in an array
            dates: [],
            //array containing date indexed data points
            //e.g. data:[{date:'2015-12-01',data:''},...]
            data:[],
            dateFormat: "",
            dayTemplateId: "",

            //default week view is horizontal(most scenarios)
            vertical: false
        },

        _create: function () {

            //this.options.value = this._constrain(this.options.value);

            //this.element.addClass("calendar");
            //this.options.dates = this._calculateMonthDates(this.options.today.getMonth(), this.options.today.getFullYear());
            if (this.options.vertical) {
                this.element.addClass("vertical");
            }
            this.refresh();
        },
        refresh: function () {
            var me = this;

            //refresh the dates
            me.options.dates = me._calculateMonthDates(me.options.selectedDate.getMonth(), me.options.selectedDate.getFullYear());

            //set month header
            me.element.find('li.header').text($.datepicker.formatDate('MM yy', me.options.selectedDate));

            //reset previous and next month dates
            me.element.find('.previousmonth,.nextmonth').removeClass('previousmonth nextmonth');
            //get current month
            var currentMonth = this.options.selectedDate.getMonth();            
            //set the dates
            me.element.find('ol.week li').each(function (index) {
                var currentDate = me.options.dates[index];
                me._populateDayTemplate(this,currentDate);
                //if current date does not belong to current month
                if (currentMonth != currentDate.getMonth()) {
                    //if index is less than 7, that means currentDate is from previous month
                    if (index < 7) {
                        $(this).addClass('previousmonth');
                    }
                    //if index is greater than 28, that means currentDate from next month
                    if (index >= 28) {
                        $(this).addClass('nextmonth');
                    }
                }
                
            });

            //reset last hidden week
            me.element.find('.doesnotbelongtomonth').removeClass('doesnotbelongtomonth');
            //hide the last week if it has no dates that falls in selected month            
            if (!this._checkIfWeekBelongsToSelectedMonth(5)) {
                me.element.find('ol.week.5').parent().addClass('doesnotbelongtomonth');
            }

            //refresh styles
            me._refreshStyle();
        },

        _populateDayTemplate: function (element,value) {
            
            //check if template specified
            if (this.options.dayTemplateId && $("#"+this.options.dayTemplateId).length) {
                //create the day html object using the template
                var temp = $($("#" + this.options.dayTemplateId).html());
                //fill the header
                temp.find('span.header').text(this.options.dateFormat ? $.datepicker.formatDate(this.options.dateFormat, value) : value);

                //fill body with supplied data
                if (this.options.data) {
                    var d = this.options.data.filter(this.getData, value)
                    temp.find('div.content').text(d && d[0] ? d[0].data : "");
                }
                
                $(element).empty().append(temp);
            } else {
                //if no date format specified, display native format
                $(element).text(this.options.dateFormat ? $.datepicker.formatDate(this.options.dateFormat, value) : value);
            }
        },
        getData: function (element, index, array) {
            return element.date == $.datepicker.formatDate("yy-mm-dd", this);
        },
        _calculateMonthDates: function (month,year) {
            var dates = [];

            //get first day of the given month
            //month is zero based

            var firstDay = new Date(year, month, 1);
            var offset  = -firstDay.getDay() + 1;

            for (var position=0; position < 42; position++,offset++) {
                dates.push(new Date(year, month, offset));
            }

            return dates;
        },
        _refreshStyle: function () {

        },
        _setOption: function (key, value) {

            if (key === "selectedDate") {
                
                //check if the date is a valid date
                try {
                    value = $.datepicker.parseDate('yy-mm-dd', value);
                    this._super(key, value);
                    this.refresh();
                } catch (e) {
                    console.warn(e);
                }
            }

            
        },
        _setOptions: function (options) {
            this._super(options);
            this.refresh();
        },
        _checkIfWeekBelongsToSelectedMonth:function(index){
            //get the set of 7 dates for the given week(index)
            //check if any one date belongs to the selected month
            //if not return false;
            var week = this.options.dates.slice(index * 7, (index * 7) + 7);
            var currentMonth = this.options.selectedDate.getMonth();

            //none of the weeks date belongs to selected month
            var weekBelongsToMonth = false;

            $.each(week, function (index, value) {
                if (currentMonth == value.getMonth()) {
                    //this date belong to the month
                    weekBelongsToMonth = true;
                }
            });

            return weekBelongsToMonth;
        },
        moveNext: function () {
            var month = this.options.selectedDate.getMonth();
            this.options.selectedDate.setMonth(month + 1);
            this.refresh();
        },
        movePrevious: function () {
            var month = this.options.selectedDate.getMonth();
            this.options.selectedDate.setMonth(month - 1);
            this.refresh();
        },
        moveTo: function (value) {
            this._setOption('selectedDate', value);
        }
    });
}(jQuery));