using API.Middleware;
using API.SignalR;
using Application.Activities.Queries;
using Application.Activities.Validators;
using Application.Core;
using Application.Interfaces;
using Domain;
using FluentValidation;
using Infrastructure.Email;
using Infrastructure.Photos;
using Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Resend;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
/* KNW_REACT :-That block configures MVC controllers and applies a global authorization rule:-
(*)builder.Services.AddControllers(...) registers ASP.NET Core MVC controllers in the 
    DI container and lets you customize MVC options.
(*)Inside the options callback, new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build() 
    creates an authorization policy that requires the request to be from an authenticated user.
(*)opt.Filters.Add(new AuthorizeFilter(policy)) adds that policy as a global filter, 
    meaning every controller action will require authentication by default.
(*)Net effect: all controller endpoints are protected unless you explicitly 
    allow anonymous access (e.g., with [AllowAnonymous]) or override the 
    policy on specific actions/controllers.
*/
builder.Services.AddControllers(opt => 
{
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    opt.Filters.Add(new AuthorizeFilter(policy));
});
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddCors();
builder.Services.AddSignalR();
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssemblyContaining<GetActivityList>();
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
    cfg.LicenseKey = builder.Configuration["Licences:MediatR"];
});
builder.Services.AddHttpClient<ResendClient>();
builder.Services.Configure<ResendClientOptions>(opt =>
{
    opt.ApiToken = builder.Configuration["Resend:ApiToken"]!;
});
builder.Services.AddTransient<IResend, ResendClient>();
builder.Services.AddTransient<IEmailSender<User>, EmailSender>();
builder.Services.AddScoped<IUserAccessor, UserAccessor>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.AddAutoMapper(cfg =>
{
    cfg.LicenseKey = builder.Configuration["Licences:MediatR"];
}, typeof(MappingProfiles));
builder.Services.AddValidatorsFromAssemblyContaining<CreateActivityValidator>();
builder.Services.AddTransient<ExceptionMiddleware>();
builder.Services.AddIdentityApiEndpoints<User>(opt =>
    {
        opt.User.RequireUniqueEmail = true;
        opt.SignIn.RequireConfirmedEmail = true;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

/*Below block registers a custom authorization policy named IsActivityHost:-
  Net effect: any endpoint decorated with [Authorize(Policy = "IsActivityHost")] will only allow 
  users who pass that custom “is host” check.
*/    
/*builder.Services.AddAuthorization(...) :- adds authorization services and lets you configure policies.*/
builder.Services.AddAuthorization(opt =>
{
    /*opt.AddPolicy("IsActivityHost", policy => { ... }) creates a policy you can use 
     with [Authorize(Policy = "IsActivityHost")].*/
    opt.AddPolicy("IsActivityHost", policy => 
    {
        /*policy.Requirements.Add(new IsHostRequirement()) attaches a custom requirement 
        that must be satisfied for the policy to succeed.
        The logic that decides how it’s satisfied lives in your IsHostRequirementHandler.*/
        policy.Requirements.Add(new IsHostRequirement());
    });
});

/* That line registers your custom authorization handler with dependency injection:
(*)AddTransient<IAuthorizationHandler, IsHostRequirementHandler>() tells ASP.NET Core: whenever the 
    authorization system needs an IAuthorizationHandler, create a new IsHostRequirementHandler instance.
(*)The handler contains the logic for your IsHostRequirement policy 
   (checking if the current user is the host of the activity).
(*)Net effect:- the IsActivityHost policy can actually run its custom check 
    because the handler is available to the authorization system.
*/
builder.Services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();
app.UseCors(x => x
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()
    .WithOrigins("http://localhost:3000", "https://localhost:3000"));

app.UseAuthentication();
app.UseAuthorization();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
app.MapGroup("api").MapIdentityApi<User>();
app.MapHub<CommentHub>("/comments");
app.MapFallbackToController("Index", "Fallback");

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<AppDbContext>();
    var userManager = services.GetRequiredService<UserManager<User>>();
    await context.Database.MigrateAsync();
    await DbInitializer.SeedData(context, userManager);
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred during migration");
}

app.Run();


/* To Access the user to Application below setting is needed :-
    update [reactivities].[dbo].[AspNetUsers] set EmailConfirmed=1,PhoneNumberConfirmed=0,TwoFactorEnabled=0 where  Email ='bob@test.com'
*/