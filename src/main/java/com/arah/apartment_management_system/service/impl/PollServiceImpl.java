package com.arah.apartment_management_system.service.impl;

import com.arah.apartment_management_system.dto.poll.CreatePollRequest;
import com.arah.apartment_management_system.dto.poll.OptionResult;
import com.arah.apartment_management_system.dto.poll.PollResponse;
import com.arah.apartment_management_system.dto.poll.PollResultResponse;
import com.arah.apartment_management_system.entity.Poll;
import com.arah.apartment_management_system.entity.PollOption;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.entity.Vote;
import com.arah.apartment_management_system.enums.PollStatus;
import com.arah.apartment_management_system.exception.BadRequestException;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.mapper.PollMapper;
import com.arah.apartment_management_system.repository.PollOptionRepository;
import com.arah.apartment_management_system.repository.PollRepository;
import com.arah.apartment_management_system.repository.UserRepository;
import com.arah.apartment_management_system.repository.VoteRepository;
import com.arah.apartment_management_system.service.PollService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PollServiceImpl implements PollService {

    private final UserRepository userRepository;
    private final PollRepository pollRepository;
    private final VoteRepository voteRepository;
    private final PollOptionRepository pollOptionRepository;
    private final PollMapper pollMapper;

    @Transactional
    public void createPoll(CreatePollRequest request, String username) {

        if (request.getOptions() == null || request.getOptions().size() < 2) {
            throw new BadRequestException("Poll must have at least 2 options");
        }

        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Poll poll = new Poll();
        poll.setQuestion(request.getQuestion());
        poll.setEndDate(request.getEndDate());
        poll.setStatus(PollStatus.ACTIVE);
        poll.setCreatedBy(admin);

        List<PollOption> pollOptions = request.getOptions().stream().map(optionText -> {
            PollOption option = new PollOption();
            option.setOptionText(optionText);
            option.setPoll(poll);
            return option;
        }).collect(Collectors.toList());
        poll.setOptions(pollOptions);

        pollRepository.save(poll);
    }

    @Transactional
    public void vote(Long pollId, Long optionId, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found"));

        if (poll.getStatus() != PollStatus.ACTIVE) {
            throw new BadRequestException("Poll is closed");
        }

        if (poll.getEndDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Poll expired");
        }

        if (voteRepository.existsByUserAndPoll(user, poll)) {
            throw new BadRequestException("You already voted");
        }

        PollOption option = pollOptionRepository.findById(optionId)
                .orElseThrow(() -> new ResourceNotFoundException("Option not found"));

        Vote vote = new Vote();
        vote.setUser(user);
        vote.setPoll(poll);
        vote.setOption(option);

        voteRepository.save(vote);

        pollOptionRepository.incrementVoteCount(optionId);
    }

    @Override
    public List<PollResponse> getActivePolls() {
        return pollRepository.findByStatus(PollStatus.ACTIVE).stream()
                .map(pollMapper::toPollResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PollResponse> getAllPolls() {
        return pollRepository.findAll().stream()
                .map(pollMapper::toPollResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PollResultResponse getPollResults(Long pollId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found"));

        List<OptionResult> results = pollMapper.toOptionResults(poll);

        PollResultResponse response = new PollResultResponse();
        response.setQuestion(poll.getQuestion());
        response.setResults(results);

        return response;
    }
}
