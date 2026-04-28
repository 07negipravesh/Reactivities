using Application.Activities.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities.Queries;

public class GetActivityDetails
{
    public class Query : IRequest<Result<ActivityDto>>
    {
        public required string Id { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor) : IRequestHandler<Query, Result<ActivityDto>>
    {
        public async Task<Result<ActivityDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            /*
                That query fetches a single activity by id and projects it directly into a DTO: 
                (*)Net effect: one DB query, returns a single ActivityDto tailored to the current user.            
            */
            var activity = 
                /* context.Activities starts an EF Core query over the Activities table.*/
                await context.Activities
                /* .ProjectTo<ActivityDto>(mapper.ConfigurationProvider, new { currentUserId = userAccessor.GetUserId() }) 
                    tells AutoMapper to translate the query so EF only selects the fields needed for ActivityDto. 
                    It also passes a parameter (currentUserId) into the mapping so the DTO can include 
                    user-specific fields (e.g., IsHost, IsGoing).
                */
                .ProjectTo<ActivityDto>(mapper.ConfigurationProvider, 
                    new { currentUserId = userAccessor.GetUserId() })
                /* .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken) filters by the requested id, 
                returns the first match, or null if not found.*/
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (activity == null) return Result<ActivityDto>.Failure("Activity not found", 404);

            return Result<ActivityDto>.Success(activity);
        }
    }
}