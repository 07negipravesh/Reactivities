using System;
using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities.Commands;

public class UpdateAttendance
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Id { get; set; }
    }

    public class Handler(IUserAccessor userAccessor, AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        // Summary: Handles attendance toggle for the current user (host cancels/reactivates, attendee joins/leaves); example: if host clicks cancel, IsCancelled switches true/false.
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken) // Entry method for attendance update command; example: Handle(new Command { Id = "act1" }, token).
        { // Starts method body where attendance logic runs; example: all checks happen inside this block.
            var activity = await context.Activities // Starts query to load the requested activity; example: fetch activity with id "act1".
                .Include(a => a.Attendees) // Loads attendees collection with the activity; example: attendee list comes with activity.
                .ThenInclude(u => u.User) // Loads each attendee's linked user details; example: attendee.User.DisplayName available.
                .SingleOrDefaultAsync(x => x.Id == request.Id, cancellationToken); // Gets one matching activity or null; example: null if id is invalid.

            if (activity == null) return Result<Unit>.Failure("Activity not found", 404); // Returns 404-style failure when activity doesn't exist; example: unknown id -> not found.

            var user = await userAccessor.GetUserAsync(); // Gets currently logged-in user from context; example: current user = "john".

            var attendance = activity.Attendees.FirstOrDefault(x => x.UserId == user.Id); // Finds this user's attendance record if present; example: existing join row.
            var isHost = activity.Attendees.Any(x => x.IsHost && x.UserId == user.Id); // Checks if current user is host of this activity; example: host user returns true.

            if (attendance != null) // Branch when user is already in attendee list; example: user already joined.
            { // Starts logic for existing attendee behavior; example: cancel/leave flow.
                if (isHost) activity.IsCancelled = !activity.IsCancelled; // Host toggles activity cancel status; example: false -> true.
                else activity.Attendees.Remove(attendance); // Non-host leaves activity by removing attendance row; example: attendee clicks leave.
            } // Ends existing attendee branch; example: user either toggled cancel or was removed.
            else // Branch when user is not attending yet; example: new attendee joins.
            { // Starts add-attendee logic; example: create attendance entry.
                activity.Attendees.Add(new ActivityAttendee // Adds a new attendee record for current user; example: insert join row.
                { // Starts object initializer for new attendance entity; example: set required fields.
                    UserId = user.Id, // Sets user id for the new attendee row; example: "user123".
                    ActivityId = activity.Id, // Links attendee row to current activity; example: "activity456".
                    IsHost = false // Marks new attendee as non-host; example: regular participant.
                }); // Ends new attendance object and adds it to collection; example: join completed in memory.
            } // Ends add-attendee branch; example: user now appears in attendee list.

            var result = await context.SaveChangesAsync(cancellationToken) > 0; // Saves changes and checks if at least one row changed; example: true when DB update succeeds.

            return result // Returns success/failure Result based on save outcome; example: true -> Success(Unit.Value).
                ? Result<Unit>.Success(Unit.Value) // Success response for caller when DB save worked; example: API returns 200.
                : Result<Unit>.Failure("Problem updating attendance", 400); // Failure response when save did not persist; example: API returns 400 message.
        } // Ends Handle method; example: command processing complete.
    }
}