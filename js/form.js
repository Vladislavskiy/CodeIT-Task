'use strict'
$(function(){
  function CustomValidation(arr) {
    // массив сообщений об ошибках
    let invalidities = [];
    // проверяем валидность
    this.checkValidity = function(input) {
      let validity = input.validity;
      if (validity.valueMissing) { // пустое поле
        invalidities.push('Fill this field!');
        return;
      }
      if (validity.tooLong) { // больше max
        invalidities.push('The entered value is greater than ' + $(input).attr('maxlength') + '!');
      }
      if (validity.tooShort) { // меньше min
        invalidities.push('The entered value is less than ' + $(input).attr('minlength') + '!');
      }
      if (/\s/.test(input.value)) { // есть пробелы
        invalidities.push('Don`t use spaces!');
      }
      if (/\W/.test(input.value) && $(input).attr('type') != 'email') { // есть не латинские символы
        invalidities.push('Use only latin alphabet!');
      }
      //корректность имени/фамилии
      if ($(input).attr('name') == 'name' || $(input).attr('name') == 'secondname') {
        if (/\d/.test(input.value)) { // есть цифры
          invalidities.push('Don`t use numbers!');
        }
      }
      // правильность email`а
      if ($(input).attr('type') == 'email') {
        if ( !( /^(?!.*@.*@.*$)(?!.*@.*\-\-.*\..*$)(?!.*@.*\-\..*$)(?!.*@.*\-$)(.*@.+(\..{1,11})?)$/.test(input.value) ) ) {
          invalidities.push('Write correct email!');
        }
        let dog = input.value.indexOf('@');
        let point = input.value.indexOf('.');
        let copyEmailValue = input.value.slice(0, dog) + input.value.slice(dog + 1, point) + input.value.slice(point+1);
        if (/\W/.test(copyEmailValue)) {
          invalidities.push('Use only latin alphabet!');
        }
      }
      // checkbox стоит галочка
      if ($(input).attr('type') == 'checkbox') {
        if (!input.checked) { // галочки нет
          invalidities.push('Please, agree with conditions!');
        }
      }
      // правильность пароля
      if ($(input).attr('type') == 'password') {
        if (!/[A-Z]/.test(input.value)) { // нет ни одной заглавной буквы
          invalidities.push('Use at least one capital letter!');
        }
        if (!/\d/.test(input.value)) { // нет ни одной цифры
          invalidities.push('Use at least one number!');
        }
      }
      // возвращаем флаг для остановки/отправки формы
      if (invalidities.length != 0) {
        return false;
      } else {
        return true;
      }
    }
    // создаем общий текст сообщений об ошибках
    function getInvaliditiesForHTML() {
      return invalidities.join(' ');
    }
    // создаем уведомления об ошибках
    this.makeErrorMessages = function(input) {
      let errorMessages = $(input.parentElement.parentElement).find('.error-message'); // ошибка текущего поля
      if (invalidities.length != 0) { // если найдены ошибки
        // элемент ошибки для этого поля уже есть
        if (errorMessages.length != 0) {
          errorMessages.remove(); // удаляем его
        }
        input.parentElement.insertAdjacentHTML('afterend', '<p class="error-message">' + getInvaliditiesForHTML() + '</p>');
      } else {
        errorMessages.remove();
      }
    }
  }

  // обрабатывает ответ сервера
  function responseHandler(response) {
    $('.error-message').remove(); // удаляем старые ошибки
    if (response.status === 'OK') { // пользователь зарегистрирован
      document.location.href = 'companies.html';
    }
    if (response.status === 'Form Error') { // ошибка валидации
      if (response.message.indexOf('is not valid') > -1) { // поле не валидно
        $('[name=' + response.field + ']')[0].parentElement.insertAdjacentHTML('afterend', "<p class='error-message'>" + response.message + '</p>');
      }
      if (response.message.indexOf('is required') > -1) { // поле обязательно для ввода
        $('[name=' + response.field + ']')[0].parentElement.insertAdjacentHTML('afterend', "<p class='error-message'>" + response.message + '</p>');
      }
      if (response.message.indexOf('should contain from') > -1) { // поле содержит не правильное ко-во символов
        $('[name=' + response.field + ']')[0].parentElement.insertAdjacentHTML('afterend', "<p class='error-message'>" + response.message + '</p>');
      }
    }
    if (response.status === 'Error') { // ошибка сервера
      if (response.message === 'Creating user error. Email already exists.') { // email уже существует
        $('[name=email]')[0].parentElement.insertAdjacentHTML('afterend', "<p class='error-message'>" + response.message + '</p>');
      }
      if (response.message === 'Wrong route') { // не правильно указан адресс отправки формы
        $('.form').append("<p class='error-message'>" + response.message + '</p>');
      }
    }
  }

  let $inputs = $('input:not([type=submit])')
  // отправка формы
  $('.form').on('submit', function(event) {
    event.preventDefault();
    let validationResult = true; // флаг
    // Пройдёмся по всем полям
    for (let i = 0; i < $inputs.length; i++) {
      let $input = $inputs[i];
      // Проверим валидность поля
      let $inputCustomValidation = new CustomValidation();
      if(!$inputCustomValidation.checkValidity($input)) { // выявляем ошибки
        validationResult = false;
      }
      $inputCustomValidation.makeErrorMessages($input); // выводим ошибки
    }
    if (validationResult) { // валидатор не ругается
      $.ajax({
            type: $(this).attr('method'),
            url: $(this).attr('action'),
            data: new FormData(this),
            crossDomain: true,
            contentType: false,
            cache: false,
            processData: false,
            success: function(result) {
              console.log(result);
              responseHandler(result);
            },
            error: function (data) {
              console.log('Error', data);
            },
        });
    }
  });
});
