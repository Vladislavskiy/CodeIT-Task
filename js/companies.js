'use strict'
$(function() {
  // флаги загрузки данных
  let checkLoadCompany = false;
  let checkLoadNews = false;
  $.ajax({
        type: 'POST',
        url: 'http://codeit.pro/codeitCandidates/serverFrontendTest/company/getList',
        data: new FormData(this),
        contentType: false,
        cache: false,
        processData: false,
        success: function(result) {
          console.log(result);
          checkLoadCompany = true;
          dataLoaded();
          companiesHandler(result);
        },
        error: function (data) {
          console.log('Error', data);
        },
    });
    $.ajax({
          type: 'POST',
          url: 'http://codeit.pro/codeitCandidates/serverFrontendTest/news/getList',
          data: new FormData(this),
          contentType: false,
          cache: false,
          processData: false,
          success: function(result) {
            console.log(result);
            checkLoadNews = true;
            dataLoaded(result);
            newsHandler(result);
          },
          error: function (data) {
            console.log('Error', data);
          },
      });
  function dataLoaded() { // убираем лоадеры
    if (checkLoadNews && checkLoadCompany) {
      $('.block').css('background-image', 'none');
      $('.total__container').addClass('visible');
      $('.names__container').addClass('visible');
      $('.location__container').addClass('visible');
      $('.news__container').addClass('visible');
    }
  }
  // для создания DOM элементов
  function createElement(tag, parent, classNames, attributes) {
    let elem = document.createElement(tag);
    if (arguments[1] != null) {
      $(parent).append(elem);
    }
    if (arguments[2] != null) {
      $(elem).addClass(classNames);
    }
    if (arguments[3]) {
      $(elem).attr(attributes);
    }
    return elem;
  }

  function companiesHandler(response) {
    // считает компании
    $('.countCircle__number').text(Object.keys(response.list).length);

    class ListItem {
      constructor(item, parent) {
        this.listItem = item;
        this.parent = parent;
      }
      makeItem() {
        let elem = createElement('li', this.parent, 'list__item')
         if (this.listItem['name']) {
           $(elem).text(this.listItem['name']);
         } else { $(elem).text(this.listItem) }
        elem.listItem = this.listItem;
      }
    }

    response.list.forEach(function(item, i, arr) { // создаем список компаний
      let company = new ListItem(response.list[i], $('.list'));
      company.makeItem();
    });

    cssForList('.names'); // адекватное отображение border`ов списка
    function cssForList(context) {
      if ($(context + ' .list__item').length > 1) {
        $(context + ' .list__item').css('border-bottom', 'none');
        $($(context + ' .list__item')[$(context + ' .list__item').length - 1]).css('border-bottom', '1px solid black');
      }
      if ($(context + ' .list__item').length > 5) {
        $(context + ' .list').css({
          'border-top' : '1px solid black',
          'border-bottom' : '1px solid black',
        });
        $(context + ' .list__item').css('border-right', 'none');
        $($(context + ' .list__item')[0]).css('border-top', 'none');
        $($(context + ' .list__item')[$(context + ' .list__item').length - 1]).css('border-bottom', 'none');
      }
    }

    class PartnersList {
      createPartnersBlock() { // создаем HTML
        let block = createElement('div', null, 'block partners');
        $('.names').after(block)
        let title = createElement('div', block, 'block__title');
        let caption = createElement('h1', title);
        $(caption).text('Company partners');

        let sortMethods = createElement('div', title, 'sortMethods');
        let sortBy = createElement('b', sortMethods);
        $(sortBy).text('Sort by:');

        let sortByName = createElement('span', sortMethods);
        $(sortByName).text('Name');
        let sortMethodsRadiosN = createElement('div', sortMethods, 'sortMethods__radios');
        let radio1 = createElement('input', sortMethodsRadiosN, null, {
          'type' : 'radio',
          'name' : 'sortMethod',
          'value' : 'byNameToPlus',
          'id' : 'radioNPlus'
        });
        let label1 = createElement('label', sortMethodsRadiosN, 'sortMethods__labelPlus', {'for' : 'radioNPlus'});
        let radio2 = createElement('input', sortMethodsRadiosN, null, {
          'type' : 'radio',
          'name' : 'sortMethod',
          'value' : 'byNameToMinus',
          'id' : 'radioNMinus'
        });
        let label2 = createElement('label', sortMethodsRadiosN, 'sortMethods__labelMinus', {'for' : 'radioNMinus'});

        let sortByPercent = createElement('span', sortMethods);
        $(sortByPercent).text('Percentage');
        let sortMethodsRadiosP = createElement('div', sortMethods, 'sortMethods__radios');
        let radio3 = createElement('input', sortMethodsRadiosP, null, {
          'type' : 'radio',
          'name' : 'sortMethod',
          'value' : 'byPercentToPlus',
          'id' : 'radioPPlus'
        });
        let label3 = createElement('label', sortMethodsRadiosP, 'sortMethods__labelPlus', {'for' : 'radioPPlus'});
        let radio4 = createElement('input', sortMethodsRadiosP, null, {
          'type' : 'radio',
          'name' : 'sortMethod',
          'value' : 'byPercentToMinus',
          'id' : 'radioPMinus',
        });
        radio4.checked = true;
        let label4 = createElement('label', sortMethodsRadiosP, 'sortMethods__labelMinus', {'for' : 'radioPMinus'});
        let container = createElement('div', block, 'partners__container');
      }
      _checkSortMethod() {
        let checked = $('[name=sortMethod]:checked')[0]
        if (checked) {
          return checked.value;
        }  else { return };
      }
      sort() {
        switch (this._checkSortMethod()) {
          case 'byNameToPlus':
            this.listItem.partners.sort(function(a, b) {return a['name'] < b['name'] });
            break;
          case 'byNameToMinus':
            this.listItem.partners.sort(function(a, b) {return a['name'] > b['name'] });
            break;
          case 'byPercentToPlus':
            this.listItem.partners.sort(function(a, b) {return a['value'] - b['value'] });
            break;
          case 'byPercentToMinus':
            this.listItem.partners.sort(function(a, b) {return b['value'] - a['value'] });
            break;
          default:
            this.listItem.partners.sort(function(a, b) {return b['value'] - a['value'] });
        }
      }
      // заполняем список
      fillingPartners() {
        this.listItem.partners.forEach(function(item, i, arr) {
          let partner = createElement('div', $('.partners__container'), 'partner');
          let circle = createElement('div', partner, 'partner__circle');
          $(circle).text(item['value'] + '%');
          let line = createElement('div', partner, 'partner__line');
          let rectangle = createElement('div', partner, 'partner__rectangle');
          let partnerName = createElement('p', rectangle, 'partner__name');
          $(partnerName).text(item['name']);
        });
      }
    }

    // выбор компании, создаем список партнеров
    let listPartners = new PartnersList();
    $('.list').on('click', function(event) {
      if ($(event.target).hasClass('list__item')) { // ловим событие
        if ($(event.target).hasClass('list__item-selected')) { // target уже выбран?
          $(event.target).removeClass('list__item-selected');
          $('.partners').remove();
        } else { // target не выбран?
          if ($('.list__item-selected').length > 0) { // выбрны другие эл-ты?
            $('.list__item-selected').removeClass('list__item-selected');
            $('.partners__container').empty();
          } else { // нет других выбранных эл-ов
            listPartners.createPartnersBlock();
          }
          $(event.target).addClass('list__item-selected');
          listPartners.listItem = event.target.listItem;
          listPartners.sort();
          listPartners.fillingPartners();
        }
      }
    });

    // выбор сортировки
    $('body').on('click', function(event) {
      if ( $(event.target).attr('name') == 'sortMethod' && !($(event.target).attr('checked')) ) {
        $('.partners__container').empty();
        listPartners.sort(event.target.listItem);
        listPartners.fillingPartners(event.target.listItem);
      }
    });

    class Country {
      constructor (name) {
        this.name = name;
        this.companies = [];
      }
      findCompanies(list) {
        let self = this;
        list.forEach(function(item, i, arr) {
          if (self.name == arr[i].location.name) {
            self.companies.push(arr[i].name);
          }
        });
        this.countCompanies = this.companies.length;
        this._makeColor();
      }
      _makeColor() {
        this.color = '#' + Math.random().toString(16).substr(-6);
      }
      makeElem() {
        let elem = createElement('li', $('.location__legend'), 'location__item');
        $(elem).css('color', this.color)
               .text(this.name);
        elem.classElement = this;
      }
    }

    let countriesArr = [];
    let counts = [];
    let colors = [];
    // создаем общий список стран
    let countries = {};
    response.list.forEach(function(item, i, arr) {
      let str = arr[i].location.name;
      countries[str] = true;
    });
    for (let key in countries) {
      let country = new Country(key);
      country.findCompanies(response.list);
      country.makeElem();
      countriesArr.push(country.name);
      counts.push(country.countCompanies);
      colors.push(country.color);
    }

    // рисуем круговую диаграмму
    function diogram() {
      let data = {
        datasets: [{
          data: counts,
          backgroundColor: colors,
        }],
        labels: countriesArr
      };
      let ctx = document.getElementById("myChart").getContext('2d');
      let myPieChart = new Chart(ctx,{
        type: 'pie',
        data: data,
        options: {
          legend: {
            display: false
          },
        }
      });
    }
    diogram();

    // выводим писок компаний страны
    $('.location__legend').on('click', function(event) {
      if ($(event.target).hasClass('location__item')) {
        $('.location__container').css('display', 'none');
        let newNamesContainer = createElement('div', $('.location'), 'newNames__container');
        let list = createElement('ul', newNamesContainer, 'list');
        event.target.classElement.companies.forEach(function(item, i, arr) {
            let listItem = new ListItem(item, list);
            listItem.makeItem();
        });
        cssForList('.location'); // адекватное отображение border`ов списка
        let backButton = createElement('img', $('.location > .block__title'), 'location__back', {'src' : 'img/back_arrow.svg', 'alt' : 'arrow', 'width' : '30px;'});
      }
    });
    // возвращаем диаграмму
    $('.location .block__title').on('click', function(event) {
      if ($(event.target).hasClass('location__back')) {
        $('.location__container').css('display', 'flex');
        $('.newNames__container').remove();
        $('.location__back').remove();

      }
    });
  }

  function newsHandler(response) {
    class News {
      constructor(item, i) {
        this.title = 'Title'; // в полученных данных нет названий статей
        this.img = item.img;
        this.link = 'https://' + item.link;
        this.author = item.author;
        this.date = this._createData(item.date);
        this.description = item.description;
      }
      createHTML(i) {
        let newBlock = createElement('div', $('.news__container'), 'new', {'display':'none'});
        let figure = createElement('figure', newBlock, 'new__left');
        let img = createElement('img', figure, 'new__img', {'title' : 'imageNews', 'src' : this.img});
        let fig1 = createElement('figcaption', figure);
        $(fig1).text('Author:');
        let span1 = createElement('span', fig1, 'new__author');
        $(span1).text(this.author);
        let fig2 = createElement('figcaption', figure);
        $(fig2).text('Date:');
        let span2 = createElement('span', fig2, 'new__date');
        $(span2).text(this.date);
        let right = createElement('div', newBlock, 'new__right');
        let title = createElement('h2', right);
        let a = createElement('a', title, 'new__link', {'href' : this.link});
        $(a).text(this.title);
        let text = createElement('p', right, 'new__text');
        $(text).text(this.description);
        this._createRadio(i);
      }
      _createData(unix) {
        let a = new Date(unix * 1000);
        let day;
        let month;
        if (a.getDate() < 10) {
          day = '0' + a.getDate();
        } else { day = a.getDate() }
        if (a.getMonth() < 10) {
          month = '0' + a.getMonth();
        } else { month = a.getMonth() }
        return day + '.' + month + '.' + a.getFullYear();
      }
      _createRadio(i) {
        let radio = createElement('input', $('.news__radios'), null, {'type' : 'radio', 'name' : 'slider', 'id' : 'radio' + i});
        if (i == 0) {radio.checked = true}
        let label = createElement('label', $('.news__radios'), 'news__label', {'for' : 'radio' + i});
        radio.order = i;
      }
    }
    // создаем новости
    response.list.forEach(function(item, i, arr) {
      let news = new News(item, i);
      news.createHTML(i);
    });
    // слайдер
    $('.news__radios').on('click', function(event) {
      if ($(event.target).attr('name') == 'slider') {
        let translate = 'translateY(' + (event.target.order * -100) + '%)'
        $('.new').css('transform', translate);
      }
    })
  }
});
