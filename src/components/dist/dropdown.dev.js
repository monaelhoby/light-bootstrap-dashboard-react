"use strict";

$(".pagination").on("click", ".init", function () {
  $(this).closest(".pagination").children('li:not(.init)').toggle();
});
var allOptions = $(".pagination").children('li:not(.init)');
$(".pagination").on("click", "li:not(.init)", function () {
  allOptions.removeClass('selected');
  $(this).addClass('selected');
  $(".pagination").children('.init').html($(this).html());
  allOptions.toggle();
});