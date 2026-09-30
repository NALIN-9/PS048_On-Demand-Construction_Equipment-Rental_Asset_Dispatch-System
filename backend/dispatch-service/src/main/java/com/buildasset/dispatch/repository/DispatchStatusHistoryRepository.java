package com.buildasset.dispatch.repository;

import com.buildasset.dispatch.entity.DispatchStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DispatchStatusHistoryRepository extends JpaRepository<DispatchStatusHistory, Long> {
    List<DispatchStatusHistory> findByDispatchIdOrderByRecordedAtAsc(Long dispatchId);
}
