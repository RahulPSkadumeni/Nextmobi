function addToWishList(proId){
    alert('hi')
    document.getElementById('wishlist').style.color="brown"
    $.ajax({
        url:'/addToWishList',
        data:{
            product:proId,
        },
        method:'post',
        success:(response)=>{
            console.log('added')
            if(response.login){
                location.reload()
            }else{
                location.href='/login'
            }
        }
    })
}

    $('.delete').on('click',function (e) {
        e.preventDefault();
        var self = $(this);
        console.log(self.data('title'));
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    'Deleted!',
                    'Your file has been deleted.',
                    'success'
                )
              location.href = self.attr('href');
            }
        })

    })


    
        
  $('.added').on('click',function (e) {
    e.preventDefault();
    var self = $(this);
    console.log(self.data('title'));
   Swal.fire(
'Product Added to cart! ',
'',
'success'
).then((result) => {
     
           
          location.href = self.attr('href');
        
    })

})


  
$('.wish').on('click',function (e) {
    e.preventDefault();
    var self = $(this);
    console.log(self.data('title'));
   Swal.fire(
'Product Added to wishlist! ',
'',
'success'
).then((result) => {
     
           
          location.href = self.attr('href');
        
    })

})

function removeitemwish(wishlistId,productId){
    alert('Are You sure to remove this Product')
   
}

$('#zoom_08').ezPlus({
    zoomWindowFadeIn: 500,
    zoomWindowFadeOut: 500,
    lensFadeIn: 500,
    lensFadeOut: 500
});


