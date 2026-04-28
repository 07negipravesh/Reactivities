using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Infrastructure.Security;

public class IsHostRequirement : IAuthorizationRequirement
{
}

public class IsHostRequirementHandler(AppDbContext dbContext, IHttpContextAccessor httpContextAccessor) 
    : AuthorizationHandler<IsHostRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, IsHostRequirement requirement)
    {
        /*context.User.FindFirstValue(ClaimTypes.NameIdentifier) gets the current user’s id 
        from the JWT/identity claims. If there’s no user id, authorization fails by returning.*/
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return;
        /*httpContextAccessor.HttpContext grabs the current HTTP request context so it can read route values.*/
        var httpContext = httpContextAccessor.HttpContext;
        /*GetRouteValue("id") pulls the id from the route (like /activities/{id}), and exits if it’s missing.*/
        if (httpContext?.GetRouteValue("id") is not string activityId) return;

        /*It queries ActivityAttendees for a row where UserId matches the current user and 
        ActivityId matches the route id. AsNoTracking() is used because it’s read‑only.*/
        var attendee = await dbContext.ActivityAttendees
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.UserId == userId &&
                x.ActivityId == activityId);
        /*If no attendee row exists, it returns (authorization fails).*/
        if (attendee == null) return;
        
        /*If the attendee exists and IsHost is true, it calls context.Succeed(requirement) which marks the requirement as satisfied.*/
        if (attendee.IsHost) context.Succeed(requirement);
    }
}