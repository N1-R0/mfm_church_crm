<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMemberRequest;
use App\Models\Household;
use App\Models\Member;
use App\Models\MinistryGroup;
use App\Models\PastoralNote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    // public function __construct(){ $this->authorizeResource(Member::class,'member'); }
    public function index(Request $request): Response
    {
        $members = Member::query()->with(['household:id,name', 'ministryGroups:id,name'])->search((string) $request->string('search'))->when($request->status, fn ($q, $v) => $q->where('status', $v))->when($request->gender, fn ($q, $v) => $q->where('gender', $v))->when($request->joined_from, fn ($q, $v) => $q->whereDate('join_date', '>=', $v))->when($request->joined_to, fn ($q, $v) => $q->whereDate('join_date', '<=', $v))->orderBy(in_array($request->input('sort'), ['first_name', 'last_name', 'join_date', 'status'], true) ? $request->input('sort') : 'last_name', $request->input('direction') === 'desc' ? 'desc' : 'asc')->paginate(15)->withQueryString();

        return Inertia::render('Members/Index', ['members' => $members, 'filters' => $request->only('search', 'status', 'gender', 'joined_from', 'joined_to', 'sort', 'direction')]);
    }

    public function create(): Response
    {
        $households = Household::whereIn('name', ['Media Team', 'Social Media Team', 'Choir', 'Prayer Team', 'Ushering Team', 'Welfare Team', 'Youth Team'])
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Members/Form', ['member' => null, 'households' => $households, 'ministryGroups' => MinistryGroup::where('status', 'active')->orderBy('name')->get(['id', 'name'])]);
    }

    public function store(StoreMemberRequest $request): RedirectResponse
    {
        $member = DB::transaction(function () use ($request) {
            $data = $request->safe()->except(['ministry_group_ids', 'photo', 'remove_photo']);
            if ($request->hasFile('photo')) {
                $photoUrl = $this->storePassportPhoto($request->file('photo'));
                $data['photo_url'] = $photoUrl;
                $data['passport_photo'] = $photoUrl;
            }
            $m = Member::create($data);
            $m->ministryGroups()->sync($request->input('ministry_group_ids', []));

            return $m;
        });

        return redirect()->route('members.show', $member)->with('success', 'Member created successfully.');
    }

    public function show(Request $request, Member $member): Response
    {
        $showDonations = (bool) config('features.donations');
        $relations = [
            'household',
            'ministryGroups',
            'attendanceRecords' => fn ($q) => $q->latest('attendance_date')->limit(20),
            'communications' => fn ($q) => $q->latest('sent_at')->limit(20),
        ];
        if ($showDonations) {
            $relations['donations'] = fn ($q) => $q->latest('donation_date')->limit(20);
        }
        $member->load($relations);
        if ($request->user()->can('viewAny', PastoralNote::class)) {
            $member->load(['pastoralNotes' => fn ($q) => $q->with('author:id,name')->latest('note_date')]);
        }

        return Inertia::render('Members/Show', [
            'member' => $member,
            'showDonations' => $showDonations,
            'can' => [
                'edit' => $request->user()->can('update', $member),
                'delete' => $request->user()->can('delete', $member),
                'viewPastoralNotes' => $request->user()->can('viewAny', PastoralNote::class),
            ],
        ]);
    }

    public function edit(Member $member): Response
    {
        $member->load('ministryGroups:id');

        $households = Household::whereIn('name', ['Media Team', 'Social Media Team', 'Choir', 'Prayer Team', 'Ushering Team', 'Welfare Team', 'Youth Team'])
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Members/Form', ['member' => $member, 'households' => $households, 'ministryGroups' => MinistryGroup::where('status', 'active')->orderBy('name')->get(['id', 'name'])]);
    }

    public function update(StoreMemberRequest $request, Member $member): RedirectResponse
    {
        DB::transaction(function () use ($request, $member) {
            $data = $request->safe()->except(['ministry_group_ids', 'photo', 'remove_photo']);
            if ($request->boolean('remove_photo')) {
                $data['photo_url'] = null;
                $data['passport_photo'] = null;
            }
            if ($request->hasFile('photo')) {
                $photoUrl = $this->storePassportPhoto($request->file('photo'));
                $data['photo_url'] = $photoUrl;
                $data['passport_photo'] = $photoUrl;
            }
            $member->update($data);
            $member->ministryGroups()->sync($request->input('ministry_group_ids', []));
        });

        return redirect()->route('members.show', $member)->with('success', 'Member updated successfully.');
    }

    public function updatePhoto(Request $request, Member $member): RedirectResponse
    {
        $this->authorize('update', $member);
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $photoUrl = $this->storePassportPhoto($request->file('photo'));
        $member->update([
            'photo_url' => $photoUrl,
            'passport_photo' => $photoUrl,
        ]);

        return back()->with('success', 'Passport photograph updated successfully.');
    }

    private function storePassportPhoto(UploadedFile $file): string
    {
        $directory = public_path('uploads/passports');
        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $filename = Str::uuid()->toString().'.'.($file->getClientOriginalExtension() ?: 'jpg');
        $file->move($directory, $filename);

        return '/uploads/passports/'.$filename;
    }

    public function destroy(Member $member): RedirectResponse
    {
        $this->authorize('delete',$member);
        $member->delete();

        return redirect()->route('members.index')->with('success','Member archived.');
    }
}
